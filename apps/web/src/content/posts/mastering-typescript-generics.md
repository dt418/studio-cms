---
title: 'Mastering TypeScript Generics'
slug: 'mastering-typescript-generics'
excerpt: 'Deep dive into TypeScript generics and learn how to write reusable, type-safe code.'
coverImage: 'https://picsum.photos/seed/typescript/1200/630'
publishedAt: 2025-02-10
updatedAt: 2025-02-12
tags: ['typescript', 'programming', 'generics']
category: 'tutorials'
---

# Mastering TypeScript Generics

Generics are one of TypeScript's most powerful features. They allow you to write flexible, reusable code while maintaining type safety.

## What Are Generics?

Generics enable you to create components that work with multiple types rather than a single one. Think of them as **type variables** that can be specified when the component is used.

## Basic Generic Function

```typescript
function identity<T>(arg: T): T {
  return arg
}

const result = identity<string>('hello')
```

## Generic Constraints

You can constrain generics to ensure they have certain properties:

```typescript
interface HasLength {
  length: number
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length)
  return arg
}
```

## Generic Interfaces

```typescript
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

interface User {
  id: number
  name: string
}

const response: ApiResponse<User> = {
  data: { id: 1, name: 'John' },
  status: 200,
  message: 'Success',
}
```

## Practical Example: Repository Pattern

```typescript
interface Repository<T> {
  findById(id: string): Promise<T | undefined>
  findAll(): Promise<T[]>
  create(item: T): Promise<T>
}

class UserRepository implements Repository<User> {
  async findById(id: string): Promise<User | undefined> {
    // Implementation
    return undefined
  }

  async findAll(): Promise<User[]> {
    return []
  }

  async create(item: User): Promise<User> {
    return item
  }
}
```

## Conclusion

Generics make your TypeScript code more reusable and type-safe. Practice using them in your projects to become more proficient.
