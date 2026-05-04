'use strict';

const { z } = require('zod');

const ChatMode = z.enum(['chat', 'contract']);
const WalletAddress = z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Wallet must be a valid Ethereum address (0x...)')
    .optional();
const NetworkName = z.string().optional();
const MessageText = z.string().min(1, 'Message cannot be empty').max(2000, 'Message cannot exceed 2000 characters');
const ContractText = z.string()
    .min(1, 'Contract content cannot be empty')
    .max(500000, 'Contract content is too large')
    .optional();

const ChatRequestSchema = z.object({
    mode: ChatMode.optional(),
    message: MessageText.optional(),
    question: MessageText.optional(),
    contract: ContractText,
    contractCode: ContractText,
    wallet: WalletAddress,
    chain: NetworkName,
    contextId: z.string().optional(),
    history: z.array(z.string()).optional(),
    temperature: z.number().min(0).max(1).optional(),
})
    .refine((value) => Boolean(value.message || value.question), {
        message: 'Either message or question is required.',
        path: ['message'],
    })
    .superRefine((value, ctx) => {
        if (value.mode === 'contract' && !value.contract && !value.contractCode) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Contract content is required when mode is contract.',
                path: ['contract'],
            });
        }
    });

const ValidationErrorSchema = z.object({
    field: z.string(),
    message: z.string(),
});

const ChatResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        reply: z.string(),
        suggestedQuestions: z.array(z.string()).optional(),
    }).optional(),
    error: z.string().optional(),
    details: z.array(ValidationErrorSchema).optional(),
    retryAfter: z.number().optional(),
});

module.exports = {
    ChatRequestSchema,
    ChatResponseSchema,
    ValidationErrorSchema,
};
