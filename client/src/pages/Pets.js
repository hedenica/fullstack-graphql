import React, { useState } from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PetsList from '../components/PetsList'
import NewPetModal from '../components/NewPetModal'
import Loader from '../components/Loader'

const FETCH_PETS = gql`
  query Pets {
    pets {
      id
      name
      img
    }
  }
`
const CREATE_PET = gql`
  mutation CreatePet($newPet: NewPetInput!) {
    addPet(input: $newPet) {
      id
      name
      type
      img
    }
  }
`

export default function Pets () {
  const [modal, setModal] = useState(false)
  const { data, loading, error } = useQuery(FETCH_PETS)
  const [createPet, newPet ] = useMutation(CREATE_PET, {
    update: (cache, { data: { addPet } }) => {
      const data = cache.readQuery({ query: FETCH_PETS });

      cache.writeQuery({ 
        query: FETCH_PETS,
        data: {
          pets: [...data.pets, addPet]
        }
      });
    }
  })

  const onSubmit = ({ name, type}) => {
    createPet({ 
      variables: {
        newPet: {
          name,
          type,
        }
      }
    })
    setModal(false)
  }

  if (loading || newPet.loading) {
    return <Loader />
  }

  if (error || newPet.error ) <p>Ooops, there was an error here!</p>

  console.log(newPet.data)

  const pets = data.pets;
  
  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row between-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={pets} />
      </section>
    </div>
  )
}
