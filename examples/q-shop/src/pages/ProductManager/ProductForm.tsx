import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import ImageUploader from '../../components/common/ImageUploader'
import { PublishProductParams } from './NewProduct'
interface ProductFormProps {
  categories: string[]
  onSubmit: (product: PublishProductParams) => void
}

interface Product {
  title: string
  description: string
  price: number
  images: string[]
  category?: string
}

export const ProductForm: React.FC<ProductFormProps> = ({
  categories,
  onSubmit
}) => {
  const [product, setProduct] = useState<Product>({
    title: '',
    description: '',
    price: 0,
    images: []
  })
  const [categoryList, setCategoryList] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])

  const [newCategory, setNewCategory] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProduct({ ...product, [event.target.name]: event.target.value })
  }

  const handleSelectChange = (event: SelectChangeEvent<string | null>) => {
    const optionId = event.target.value
    const selectedOption = categoryList.find((option) => option === optionId)
    setSelectedCategory(selectedOption || null)
  }
  const handleNewCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory(event.target.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedType) return
    onSubmit({
      title: product.title,
      description: product.description,
      type: selectedType,
      images,
      price: [
        {
          currency: 'qort',
          value: product.price
        }
      ],
      mainImageIndex: 0
    })
  }

  const addNewCategoryToList = () => {
    if (!newCategory) return
    setSelectedCategory(newCategory)
    setCategoryList((prev) => [...prev, newCategory])
    setNewCategory('')
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <ImageUploader
        onPick={(img: string) => setImages((prev) => [...prev, img])}
      >
        <AddPhotoAlternateIcon
          sx={{
            height: '20px',
            width: 'auto',
            cursor: 'pointer'
          }}
        ></AddPhotoAlternateIcon>
      </ImageUploader>
      <Box
        sx={{
          display: 'flex',
          gap: 1
        }}
      >
        {images.map((base64) => {
          return (
            <img
              style={{
                width: 150,
                height: 150,
                objectFit: 'contain',
                borderRadius: '5px'
              }}
              src={base64}
            />
          )
        })}
      </Box>
      <TextField
        name="title"
        label="Title"
        variant="outlined"
        onChange={handleInputChange}
        inputProps={{ maxLength: 180 }}
        required
      />
      <TextField
        name="description"
        label="Description"
        variant="outlined"
        onChange={handleInputChange}
        required
      />
      <TextField
        name="price"
        label="Price"
        variant="outlined"
        type="number"
        onChange={handleInputChange}
        required
      />
      <InputLabel id="type">Product Type</InputLabel>
      <Select
        name="type"
        value={selectedType}
        onChange={(event) => {
          setSelectedType(event.target.value)
        }}
        variant="outlined"
        required
      >
        <MenuItem value="digital">Digital</MenuItem>
        <MenuItem value="physical">Physical</MenuItem>
      </Select>
      <InputLabel id="category">Category</InputLabel>
      <Select
        name="category"
        value={selectedCategory}
        onChange={handleSelectChange}
        variant="outlined"
        required
      >
        {categoryList.map((category) => (
          <MenuItem value={category}>{category}</MenuItem>
        ))}
      </Select>
      <TextField
        name="newCategory"
        label="New Category"
        variant="outlined"
        value={newCategory}
        onChange={handleNewCategory}
      />
      <Button variant="contained" onClick={addNewCategoryToList}>
        Add Category
      </Button>
      <Button variant="contained" type="submit">
        Submit
      </Button>
    </Box>
  )
}
