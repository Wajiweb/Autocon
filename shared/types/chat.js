const { z } = require('zod');
const { ChatRequestSchema: InternalChatRequestSchema, ChatResponseSchema } = require('../validation/chatSchema');

const ChatMode = {
  CHAT: 'chat',
  CONTRACT: 'contract'
};

const ChatRequestSchema = InternalChatRequestSchema.omit({
    question: true,
    contractCode: true,
});

module.exports = {
  ChatMode,
  ChatRequestSchema,
  ChatResponseSchema,
};
