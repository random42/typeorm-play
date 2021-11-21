interface Base {
  id: string
  createdAt: Date
  deletedAt?: Date | null
}

interface User extends Base {
  name: string
  birthday?: Date
}

interface Author extends Base {
  name: string
  birthday?: Date
}

interface Book extends Base {
  name: string
  text: string
  chapters?: Chapter[]
}

interface Chapter extends Base {
  name: string
  text: string
  book: Book
}


