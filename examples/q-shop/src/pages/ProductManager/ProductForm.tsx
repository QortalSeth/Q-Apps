import React, { useState, useEffect } from "react";
import {
  Button,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  Box
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ImageUploader from "../../components/common/ImageUploader";
import { PublishProductParams } from "./NewProduct";
import { Product } from "../../state/features/storeSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import {
  AddLogoButton,
  AddLogoIcon,
  LogoPreviewRow,
  StoreLogoPreview,
  CustomInputField
} from "../../components/modals/CreateStoreModal-styles";
import {
  CloseIcon,
  InputFieldCustomLabel,
  ProductImagesRow
} from "./NewProduct-styles";
interface ProductFormProps {
  onSubmit: (product: PublishProductParams) => void;
  onClose?: () => void;
  editProduct?: Product | null;
}

interface ProductObj {
  title?: string;
  description?: string;
  price: number;
  images: string[];
  category?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onClose,
  onSubmit,
  editProduct
}) => {
  const theme = useTheme();
  const categories = useSelector(
    (state: RootState) => state.global.listProducts.categories
  );
  const [product, setProduct] = useState<ProductObj>({
    title: "",
    description: "",
    price: 0,
    images: []
  });
  console.log({ product });
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("digital");
  const [images, setImages] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("AVAILABLE");
  const [newCategory, setNewCategory] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProduct({ ...product, [event.target.name]: event.target.value });
  };

  const handleSelectChange = (event: SelectChangeEvent<string | null>) => {
    const optionId = event.target.value;
    const selectedOption = categoryList.find((option) => option === optionId);
    setSelectedCategory(selectedOption || null);
  };
  const handleNewCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory(event.target.value);
  };

  const handleSubmit = () => {
    if (!selectedType || !selectedCategory) return;
    onSubmit({
      title: product.title,
      description: product.description,
      type: selectedType,
      images,
      category: selectedCategory,
      status: selectedStatus,
      price: [
        {
          currency: "qort",
          value: product.price
        }
      ],
      mainImageIndex: 0
    });
  };

  const addNewCategoryToList = () => {
    if (!newCategory) return;
    setSelectedCategory(newCategory);
    setCategoryList((prev) => [...prev, newCategory]);
    setNewCategory("");
  };

  useEffect(() => {
    if (categories) {
      setCategoryList(categories);
    }
  }, [categories]);

  useEffect(() => {
    if (editProduct) {
      console.log({ editProduct });
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
        } = editProduct;
        const findPrice =
          price?.find((item) => item?.currency === "qort")?.value || 0;
        console.log({
          title,
          description,
          images,
          mainImageIndex,
          type,
          price
        });
        setProduct({
          title,
          description,
          images: [],
          price: findPrice
        });
        if (images) {
          setImages(images);
        }
        if (type) {
          setSelectedType(type);
        }
        if (category) {
          setSelectedCategory(category);
        }
        if (status) {
          setSelectedStatus(status);
        }
      } catch (error) {
        console.log({ error });
      }
    }
  }, [editProduct]);

  return (
    <>
      {images.length > 0 ? (
        <ProductImagesRow>
          {images.map((img, index) => (
            <LogoPreviewRow>
              <Box style={{ position: "relative" }}>
                <StoreLogoPreview src={img} alt={`product-img-${index}`} />
                <CloseIcon
                  color={theme.palette.text.primary}
                  onClickFunc={() => {
                    setImages((prev) => prev.filter((item) => item !== img));
                  }}
                  height={"22"}
                  width={"22"}
                ></CloseIcon>
              </Box>
            </LogoPreviewRow>
          ))}
        </ProductImagesRow>
      ) : (
        <ImageUploader
          onPick={(img: string) => setImages((prev) => [...prev, img])}
        >
          <AddLogoButton>
            Add Product Image
            <AddLogoIcon
              sx={{
                height: "25px",
                width: "auto"
              }}
            ></AddLogoIcon>
          </AddLogoButton>
        </ImageUploader>
      )}
      <CustomInputField
        name="title"
        label="Title"
        variant="filled"
        value={product.title}
        onChange={handleInputChange}
        inputProps={{ maxLength: 180 }}
        required
      />
      <CustomInputField
        name="description"
        label="Description"
        value={product.description}
        variant="filled"
        onChange={handleInputChange}
        required
      />
      <CustomInputField
        name="price"
        label="Price (QORT)"
        value={product.price}
        variant="filled"
        type="number"
        onChange={handleInputChange}
        required
      />
      <InputFieldCustomLabel id="type">Product Type</InputFieldCustomLabel>
      <Select
        name="type"
        value={selectedType}
        onChange={(event) => {
          setSelectedType(event.target.value);
        }}
        variant="filled"
        required
        fullWidth
      >
        <MenuItem value="digital">Digital</MenuItem>
        <MenuItem value="physical">Physical</MenuItem>
      </Select>
      <InputFieldCustomLabel id="category">Category</InputFieldCustomLabel>
      <Select
        name="category"
        value={selectedCategory}
        onChange={handleSelectChange}
        variant="filled"
        required
        fullWidth
      >
        {categoryList.map((category) => (
          <MenuItem value={category}>{category}</MenuItem>
        ))}
      </Select>
      <CustomInputField
        name="newCategory"
        label="New Category"
        variant="filled"
        value={newCategory}
        onChange={handleNewCategory}
      />
      {editProduct && (
        <>
          <InputFieldCustomLabel id="status">Status</InputFieldCustomLabel>
          <Select
            name="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            variant="filled"
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
      <Button onClick={onClose} variant="contained">
        Close
      </Button>
      <Button onClick={handleSubmit} variant="contained">
        Submit
      </Button>
    </>
  );
};
