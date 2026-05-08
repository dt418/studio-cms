---
title: 'Mastering TypeScript Generics'
slug: 'mastering-typescript-generics'
excerpt: 'Deep dive vào TypeScript generics và học cách viết code reusable, type-safe.'
coverImage: 'https://picsum.photos/seed/typescript/1200/630'
publishedAt: 2025-02-10
updatedAt: 2025-02-10
tags: ['typescript', 'programming', 'generics']
language: 'vi'
category: 'tutorials'
---

# Mastering TypeScript Generics

Generics là một trong những tính năng mạnh nhất của TypeScript. Chúng cho phép bạn viết code linh hoạt, có thể tái sử dụng trong khi vẫn duy trì type safety.

## Generics là gì?

Generics cho phép bạn tạo các component hoạt động với nhiều types thay vì chỉ một type duy nhất. Hãy nghĩ về chúng như các **type variables** có thể được chỉ định khi component được sử dụng.

## Function Generic cơ bản

```typescript
function identity<T>(arg: T): T {
  return arg
}

const result = identity<string>('hello')
```

## Generic Constraints

Bạn có thể constrain generics để đảm bảo chúng có một số properties nhất định:

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

## Ví dụ thực tế: Repository Pattern

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

## Kết luận

Generics giúp code TypeScript của bạn có thể tái sử dụng và type-safe hơn. Hãy practice sử dụng chúng trong các project để trở nên thành thạo hơn.
