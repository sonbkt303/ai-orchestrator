import { z } from 'zod';

export const BookingRequestSchema = z.object({
  patientName: z.string().min(1),
  phone: z.string().min(1),
  serviceId: z.string().uuid(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/),
  note: z.string().optional(),
  locale: z.string().optional(),
});

export const BookingResponseSchema = z.object({
  requestId: z.string().uuid(),
  status: z.literal('requested'),
  message: z.string(),
});

export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type BookingResponse = z.infer<typeof BookingResponseSchema>;
