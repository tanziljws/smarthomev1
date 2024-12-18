// Using Prisma for database
export const CustomCommand = {
    id: 'Int',
    name: 'String',
    description: 'String',
    actions: 'Json', // Array of actions like [{"relay": 1, "state": "ON"}, ...]
    createdAt: 'DateTime',
    updatedAt: 'DateTime'
} 