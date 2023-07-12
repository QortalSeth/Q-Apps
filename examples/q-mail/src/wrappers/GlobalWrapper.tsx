import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { addUser } from '../state/features/authSlice'
import { RootState } from '../state/store'

import NavBar from '../components/layout/Navbar/Navbar'
import PageLoader from '../components/common/PageLoader'

import localForage from 'localforage'
import ConsentModal from '../components/modals/ConsentModal'
import { AudioPlayer } from '../components/common/AudioPlayer'
import { setPrivateGroups } from '../state/features/globalSlice'
interface Props {
  children: React.ReactNode
}

const GlobalWrapper: React.FC<Props> = ({ children }) => {
  const dispatch = useDispatch()

  const [userAvatar, setUserAvatar] = useState<string>('')

  const { user } = useSelector((state: RootState) => state.auth)
  const { audios, currAudio } = useSelector((state: RootState) => state.global)
  const favoritesLocalRef = useRef<any>(null)

  useEffect(() => {
    if (!user?.name) return
    const dynamicInstanceName = `q-blog-favorites-${user.name}` // Replace this with your dynamic value
    favoritesLocalRef.current = localForage.createInstance({
      name: dynamicInstanceName
    })
    getAvatar()
  }, [user?.name])

  const getAvatar = async () => {
    try {
      let url = await qortalRequest({
        action: 'GET_QDN_RESOURCE_URL',
        name: user?.name,
        service: 'THUMBNAIL',
        identifier: 'qortal_avatar'
      })

      if (url === 'Resource does not exist') return

      setUserAvatar(url)
    } catch (error) {
      console.error(error)
    }
  }

  const { isLoadingGlobal } = useSelector((state: RootState) => state.global)

  async function getNameInfo(address: string) {
    const response = await fetch('/names/address/' + address)
    const nameData = await response.json()

    if (nameData?.length > 0) {
      return nameData[0].name
    } else {
      return ''
    }
  }
  async function getGroups(address: string) {
    try {
      const groups: any = {}
      const response = await fetch('/groups/member/' + address)
      const groupData = await response.json()
      const filterPrivate = groupData?.filter(
        (group: any) => group?.isOpen === false
      )
      if (filterPrivate?.length > 0) {
        for (const group of filterPrivate) {
          const groupNumber = group.groupId
          const response = await fetch(`/groups/members/${groupNumber}?limit=0`)
          const groupData = await response.json()
          let members: any = {}
          if (groupData && Array.isArray(groupData?.members)) {
            for (const member of groupData.members) {
              if (member.member) {
                const res = await getNameInfo(member.member)
                const resAddress = await qortalRequest({
                  action: 'GET_ACCOUNT_DATA',
                  address: member.member
                })
                const name = res
                const publicKey = resAddress.publicKey
                if (name) {
                  members[name] = {
                    publicKey,
                    address: member.member
                  }
                }
              }
            }
          }
          groups[groupNumber] = {
            ...group,
            members
          }
        }

        dispatch(setPrivateGroups(groups))
      } else {
        return ''
      }
    } catch (error) {}
  }

  const askForAccountInformation = React.useCallback(async () => {
    try {
      let account = await qortalRequest({
        action: 'GET_USER_ACCOUNT'
      })

      const name = await getNameInfo(account.address)
      dispatch(addUser({ ...account, name }))
      getGroups(account.address)
    } catch (error) {
      console.error(error)
    }
  }, [])

  React.useEffect(() => {
    askForAccountInformation()
  }, [])

  return (
    <>
      {isLoadingGlobal && <PageLoader />}

      <NavBar
        isAuthenticated={!!user}
        userName={user?.name || ''}
        userAvatar={userAvatar}
        authenticate={askForAccountInformation}
      />
      <ConsentModal />
      {children}

      {audios && audios.length > 0 && (
        <AudioPlayer currAudio={currAudio} playlist={audios} />
      )}
    </>
  )
}

export default GlobalWrapper
