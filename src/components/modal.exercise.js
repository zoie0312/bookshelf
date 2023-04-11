/** @jsx jsx */
import {jsx} from '@emotion/core'
import * as React from 'react';

import {Dialog} from './lib'
import VisuallyHidden from '@reach/visually-hidden'
import {
  CircleButton,
  
} from './lib'

// 💰 Here's a reminder of how your components will be used:
/*
<Modal>
  <ModalOpenButton>
    <button>Open Modal</button>
  </ModalOpenButton>
  <ModalContents aria-label="Modal label (for screen readers)">
    <ModalDismissButton>
      <button>Close Modal</button>
    </ModalDismissButton>
    <h3>Modal title</h3>
    <div>Some great contents of the modal</div>
  </ModalContents>
</Modal>
*/

const callAll = (...fns) => (...args) => {fns.forEach(fn => fn && fn(...args))}
const ModalContext = React.createContext();

const Modal = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const contextValue = {
    isOpen,
    setIsOpen
  }
  return (
    <ModalContext.Provider value={contextValue} {...props}/>
      
  )
}

const ModalDismissButton = ({children: child}) => {
  const {setIsOpen} = React.useContext(ModalContext);
  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(false), child.props.onClick)
  })
}

const ModalOpenButton = ({children: child}) => {
  const {setIsOpen} = React.useContext(ModalContext);
  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(true), child.props.onClick)
  })
}

const ModalContentBase = (props) => {
  const {isOpen, setIsOpen } = React.useContext(ModalContext);
  return(
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props}/>
  )
}

const ModalContents = ({title, children, ...props}) => {
  return (
    <ModalContentBase {...props}>
      <div css={{display: 'flex', justifyContent: 'flex-end'}}>
        <ModalDismissButton>
            <CircleButton >
              <VisuallyHidden>Close</VisuallyHidden>
              <span aria-hidden>×</span>
            </CircleButton>
        </ModalDismissButton>
      </div>
      <h3 css={{textAlign: 'center', fontSize: '2em'}}>{title}</h3>
      {children}
    </ModalContentBase>
  )
}

export {
  Modal,
  ModalDismissButton,
  ModalOpenButton,
  ModalContents,
  ModalContentBase
}