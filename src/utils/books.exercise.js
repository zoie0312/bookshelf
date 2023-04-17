import {useQuery, queryCache} from 'react-query'

import {client} from 'utils/api-client'
import bookPlaceholderSvg from 'assets/book-placeholder.svg'

const loadingBook = {
    title: 'Loading...',
    author: 'loading...',
    coverImageUrl: bookPlaceholderSvg,
    publisher: 'Loading Publishing',
    synopsis: 'Loading...',
    loadingBook: true,
  }
  
  const loadingBooks = Array.from({length: 10}, (v, index) => ({
    id: `loading-book-${index}`,
    ...loadingBook,
  }))

const useBook = (bookId, user) => {
    const {data} = useQuery({
        queryKey: ['book', {bookId}],
        queryFn: () => client(`books/${bookId}`, {token: user.token}).then(data => data.book)
      })
    return data ?? loadingBook
}

const getBookSearchConfig = (query, user) => ({
    queryKey: ['bookSearch', {query}],
    queryFn: () => client(`books?query=${encodeURIComponent(query)}`, {
        token: user.token,
    }).then(data => data.books),
    config: {
        onSuccess: (books) => {
              books.forEach(book => {
                setQueryDataForBook(book)
            })
        }
    }
})

const setQueryDataForBook = (book) => queryCache.setQueryData(['book', {bookId: book.id}], book)

const useBookSearch = (query, user) => {
    const result = useQuery(getBookSearchConfig(query, user))

    return {...result, books: result.data ?? loadingBooks}
}

const refetchBookSearchQuery = (user) => {
    queryCache.removeQueries('bookSearch')
    queryCache.prefetchQuery(getBookSearchConfig('', user))
    
}

export {
    useBook,
    useBookSearch,
    refetchBookSearchQuery,
    setQueryDataForBook
}