import React, { useState, useEffect } from 'react'
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
import { Product } from '../../state/features/storeSlice'
import { useSelector } from 'react-redux'
import { RootState } from '../../state/store'
interface ProductFormProps {
  onSubmit: (product: PublishProductParams) => void
  editProduct?: Product | null
}

interface ProductObj {
  title?: string
  description?: string
  price: number
  images: string[]
  category?: string
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  editProduct
}) => {
  const categories = useSelector(
    (state: RootState) => state.global.listProducts.categories
  )
  const [product, setProduct] = useState<ProductObj>({
    title: '',
    description: '',
    price: 0,
    images: []
  })
  console.log({ product })
  const [categoryList, setCategoryList] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<string >('digital')
  const [images, setImages] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('AVAILABLE')
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
    if (!selectedType || !selectedCategory) return
    onSubmit({
      title: product.title,
      description: product.description,
      type: selectedType,
      images,
      category: selectedCategory,
      status: selectedStatus,
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

  useEffect(() => {
    if (categories) {
      setCategoryList(categories)
    }
  }, [categories])

  useEffect(() => {
    if (editProduct) {
      console.log({ editProduct })
      try {
        const {
          title,
          description,
          images,
          mainImageIndex,
          type,
          price,
          category,
          status
        } = editProduct
        const findPrice =
          price?.find((item) => item?.currency === 'qort')?.value || 0
        console.log({ title, description, images, mainImageIndex, type, price })
        setProduct({
          title,
          description,
          images: [],
          price: findPrice
        })
        if (images) {
          setImages(images)
        }
        if (type) {
          setSelectedType(type)
        }
        if (category) {
          setSelectedCategory(category)
        }
        if (status) {
          setSelectedStatus(status)
        }
      } catch (error) {
        console.log({ error })
      }
    }
  }, [editProduct])

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <ImageUploader
        onPick={(img: string) => setImages((prev) => [...prev, img])}
      ><span>Upload Image</span>
        <AddPhotoAlternateIcon
          sx={{
            height: '40px',
            width: 'auto',
            cursor: 'pointer'
          }}
        ></AddPhotoAlternateIcon>
      </ImageUploader>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
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
             alt={`${product.title} Image`}/>
          )
        })}
      </Box>
      <TextField
        name="title"
        label="Title"
        variant="outlined"
        value={product.title}
        onChange={handleInputChange}
        inputProps={{ maxLength: 180 }}
        required
      />
      <TextField
        name="description"
        label="Description"
        value={product.description}
        variant="outlined"
        onChange={handleInputChange}
        required
      />
      <TextField
        name="price"
        label="Price (QORT)"
        value={product.price}
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
        fullWidth
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
        fullWidth
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
      {editProduct && (
        <>
          <InputLabel id="status">Status</InputLabel>
          <Select
            name="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            variant="outlined"
            required
          >
            <MenuItem value="AVAILABLE">Available</MenuItem>
            <MenuItem value="RETIRED">Retired</MenuItem>
            <MenuItem value="OUT_OF_STOCK">Out of stock</MenuItem>
          </Select>
        </>
      )}

      <Button variant="contained" onClick={addNewCategoryToList}>
        Add Category
      </Button>
      <Button variant="contained" type="submit">
        Submit
      </Button>
    </Box>
  )
}
