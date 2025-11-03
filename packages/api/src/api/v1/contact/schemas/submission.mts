import { z } from 'zod';

export const submissionSchema = z.object({
  name: z.string().max(50),
  email: z.string().email(),
  subject: z.string().max(100),
  message: z.string().max(1000),
});

export type ContactSubmissionSchema = z.infer<typeof submissionSchema>;
