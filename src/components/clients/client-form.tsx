"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { extractErrorMessage } from "@/lib/api";
import {
  useCreateClient,
  useUpdateClient,
  type CreateClientInput,
} from "@/lib/queries/clients";

const schema = z.object({
  fullName: z.string().min(2, "Nombre muy corto"),
  phone: z.string().min(6, "Teléfono inválido"),
  email: z.string().email("Email inválido").or(z.literal("")).optional(),
  notes: z.string().optional(),
  whatsAppOptIn: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ClientInitial {
  id?: string;
  fullName?: string;
  phone?: string;
  email?: string | null;
  notes?: string | null;
  whatsAppOptIn?: boolean;
}

interface Props {
  initial?: ClientInitial;
  onSuccess?: () => void;
}

export function ClientForm({ initial, onSuccess }: Props) {
  const isEdit = !!initial?.id;
  const create = useCreateClient();
  const update = useUpdateClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: initial?.fullName ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      notes: initial?.notes ?? "",
      whatsAppOptIn: initial?.whatsAppOptIn ?? false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && initial?.id) {
        await update.mutateAsync({
          id: initial.id,
          fullName: values.fullName,
          phone: values.phone,
          email: values.email || null,
          notes: values.notes || null,
          whatsAppOptIn: values.whatsAppOptIn ?? false,
        });
        toast.success("Cliente actualizado");
      } else {
        const input: CreateClientInput = {
          fullName: values.fullName,
          phone: values.phone,
          email: values.email || null,
          notes: values.notes || null,
          whatsAppOptIn: values.whatsAppOptIn ?? false,
        };
        await create.mutateAsync(input);
        toast.success("Cliente creado correctamente");
      }
      onSuccess?.();
    } catch (err) {
      toast.error(extractErrorMessage(err, "No se pudo guardar el cliente"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre completo</Label>
        <Input placeholder="Pedro Ramírez" {...register("fullName")} />
        {errors.fullName && (
          <p className="text-xs text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input placeholder="+50588889999" {...register("phone")} />
          {errors.phone && (
            <p className="text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Email (opcional)</Label>
          <Input type="email" placeholder="cliente@email.com" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notas (opcional)</Label>
        <Textarea placeholder="Prefiere clase de 6am" {...register("notes")} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("whatsAppOptIn")} />
        Acepta recibir notificaciones por WhatsApp
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Guardar cambios" : "Crear cliente"}
        </Button>
      </div>
    </form>
  );
}
