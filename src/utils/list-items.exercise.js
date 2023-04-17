import {useQuery, useMutation, queryCache} from 'react-query'

import {client} from 'utils/api-client'
import { setQueryDataForBook } from './books.exercise'

const useListItems = (user) => {
    const {data: listItems} = useQuery({
        queryKey: ['list-items'],
        queryFn: () => client('list-items', {token: user.token}).then(data => {return data.listItems}),
        config: {
            onSuccess: (listItems) => {
                for (const item of listItems) {
                    setQueryDataForBook(item.book)
                }
            }
        }
      })
    return listItems ?? []
}

const useListItem = (user, bookId) => {
    const listItems = useListItems(user);
    return listItems.find(item => item.bookId === bookId) ?? null
}

const defaultMutationOption = {
    onSettled: () => queryCache.invalidateQueries('list-items'),
    onError: (err, variables, recover) => {
        if (typeof recover === 'function') recover()
          
    }
}

const useUpdateListItem = (user, options) => {
    return useMutation(
        (updates) => 
          client(`list-items/${updates.id}`, {token: user.token, data: updates, method: 'PUT'}),
          {
            onMutate: (newItem) => {
              const originalQueryData = queryCache.getQueryData('list-items')
              queryCache.setQueryData('list-items', old => old.map(item => {
                return item.id === newItem.id ? {...item, ...newItem} : item
              }))

              return () => queryCache.setQueryData('list-items', originalQueryData)
            },
            ...defaultMutationOption, 
            ...options}
      )
}


const useRemoveListItem = (user, options) => {
    return useMutation(
        ({id: listItemId}) => 
          client(`list-items/${listItemId}`, {token: user.token, data: {id: listItemId}, method: 'DELETE'}),
          {
            onMutate: ({id: listItemId}) => {
                const oldQueryData = queryCache.getQueryData('list-items');
                queryCache.setQueryData('list-items', old => {
                    return old.filter(item => item.id !== listItemId)
                })
                return () => queryCache.setQueryData('list-items', oldQueryData)
            },
            ...defaultMutationOption, ...options}
      )
}


const useCreateListItem = (user, options) => {
    return useMutation(
        ({bookId}) => 
           client(`list-items`, {token: user.token, data: {bookId}, method: 'POST'}),
           {...defaultMutationOption, ...options}
      )
}

export {
    useListItem,
    useListItems,
    useUpdateListItem,
    useRemoveListItem,
    useCreateListItem
}