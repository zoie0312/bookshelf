/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import {
  FaCheckCircle,
  FaPlusCircle,
  FaMinusCircle,
  FaBook,
  FaTimesCircle,
} from 'react-icons/fa'
import Tooltip from '@reach/tooltip'
import { useQuery, useMutation, queryCache } from 'react-query'
import { client } from 'utils/api-client'
import {useAsync} from 'utils/hooks'
import * as colors from 'styles/colors'
import {CircleButton, Spinner} from './lib'

function TooltipButton({label, highlight, onClick, icon, ...rest}) {
  const {isLoading, isError, error, run} = useAsync()

  function handleClick() {
    run(onClick())
  }

  return (
    <Tooltip label={isError ? error.message : label}>
      <CircleButton
        css={{
          backgroundColor: 'white',
          ':hover,:focus': {
            color: isLoading
              ? colors.gray80
              : isError
              ? colors.danger
              : highlight,
          },
        }}
        disabled={isLoading}
        onClick={handleClick}
        aria-label={isError ? error.message : label}
        {...rest}
      >
        {isLoading ? <Spinner /> : isError ? <FaTimesCircle /> : icon}
      </CircleButton>
    </Tooltip>
  )
}

function StatusButtons({user, book}) {
  const {data: listItems} = useQuery({
    queryKey: ['list-items'],
    queryFn: () => client('list-items', {token: user.token}).then(data => {return data.listItems})
    
  })
  
  const listItem = listItems?.find(item => item.bookId === book.id) ?? null

  const [update] = useMutation(
    ({id: listItemId, finishDate}) => 
      client(`list-items/${listItemId}`, {token: user.token, data: {id: listItemId, finishDate}, method: 'PUT'}),
    {onSettled: () => queryCache.invalidateQueries('list-items')}
  )

  const [remove] = useMutation(
    ({id: listItemId}) => 
      client(`list-items/${listItemId}`, {token: user.token, data: {id: listItemId}, method: 'DELETE'}),
    {onSettled: () => queryCache.invalidateQueries('list-items')}
  )

  const [create] = useMutation(
    ({bookId}) => 
       client(`list-items`, {token: user.token, data: {bookId}, method: 'POST'}),
    {onSettled: () => queryCache.invalidateQueries('list-items')}
  )

  return (
    <React.Fragment>
      {listItem ? (
        Boolean(listItem.finishDate) ? (
          <TooltipButton
            label="Unmark as read"
            highlight={colors.yellow}
            onClick={(e) => update({id: listItem.id, finishDate: null})}
            icon={<FaBook />}
          />
        ) : (
          <TooltipButton
            label="Mark as read"
            highlight={colors.green}
            onClick={(e) => update({id: listItem.id, finishDate: Date.now()})}
            icon={<FaCheckCircle />}
          />
        )
      ) : null}
      {listItem ? (
        <TooltipButton
          label="Remove from list"
          highlight={colors.danger}
          onClick={(e) => remove({id: listItem.id})}
          icon={<FaMinusCircle />}
        />
      ) : (
        <TooltipButton
          label="Add to list"
          highlight={colors.indigo}
          onClick={(e) => {
            return create({bookId: book.id})

          }}
          icon={<FaPlusCircle />}
        />
      )}
    </React.Fragment>
  )
}

export {StatusButtons}
