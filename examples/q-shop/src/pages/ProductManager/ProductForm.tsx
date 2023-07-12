import React, { useState, useEffect } from "react";
import {
  SelectChangeEvent,
  useTheme,
  Box,
  FormControl,
  Select
} from "@mui/material";
import ImageUploader from "../../components/common/ImageUploader";
import { PublishProductParams } from "./NewProduct";
import { Product } from "../../state/features/storeSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import {
  AddLogoButton,
  AddLogoIcon,
  LogoPreviewRow,
  StoreLogoPreview,
  CustomInputField,
  ButtonRow,
  CancelButton,
  CreateButton
} from "../../components/modals/CreateStoreModal-styles";
import {
  CloseIcon,
  InputFieldCustomLabel,
  ProductImagesRow,
  CustomSelect,
  CategoryRow,
  CustomMenuItem,
  AddButton,
  MaximumImagesRow
} from "./NewProduct-styles";
import { setNotification } from "../../state/features/notificationsSlice";
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
  const dispatch = useDispatch();
  const categories = useSelector(
    (state: RootState) => state.global.listProducts.categories
  );

  const [product, setProduct] = useState<ProductObj>({
    title: "",
    description: "",
    price: 0,
    images: []
  });
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("digital");
  const [images, setImages] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("AVAILABLE");
  const [newCategory, setNewCategory] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === "price") {
      const price = parseInt(event.target.value);
      if (isNaN(price)) {
        dispatch(
          setNotification({
            alertType: "error",
            msg: "Price must be a number!"
          })
        );
        return;
      }
      setProduct({ ...product, [event.target.name]: price });
      return;
    }
    setProduct({
      ...product,
      [event.target.name]: event.target.value as string | number
    });
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

  console.log({ editProduct });

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
      <MaximumImagesRow>*Maximum 3 images</MaximumImagesRow>
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
      <Box>
        <FormControl fullWidth>
          <InputFieldCustomLabel id="product-type-label">
            Product Type
          </InputFieldCustomLabel>
          <CustomSelect
            labelId="product-type-label"
            label="Product Type"
            value={selectedType}
            onChange={(event) => {
              setSelectedType(event.target.value as string);
            }}
            required
            fullWidth
          >
            <CustomMenuItem value="digital">Digital</CustomMenuItem>
            <CustomMenuItem value="physical">Physical</CustomMenuItem>
          </CustomSelect>
        </FormControl>
      </Box>
      <CategoryRow style={{ marginBottom: "10px" }}>
        <FormControl style={{ width: "60%" }}>
          <InputFieldCustomLabel shrink={true} id="product-category-label">
            Category
          </InputFieldCustomLabel>
          <CustomSelect
            notched={true}
            labelId="product-category-label"
            label="Category"
            value={selectedCategory}
            displayEmpty={true}
            onChange={(event) => {
              handleSelectChange(event as SelectChangeEvent<string | null>);
            }}
            required
            fullWidth
          >
            <CustomMenuItem value="">
              <em>Add a Category</em>
            </CustomMenuItem>
            {categoryList.map((category) => (
              <CustomMenuItem value={category}>{category}</CustomMenuItem>
            ))}
          </CustomSelect>
        </FormControl>
        <CategoryRow style={{ gap: "20px" }}>
          <CustomInputField
            style={{ flexGrow: 1 }}
            name="newCategory"
            label="New Category"
            variant="filled"
            value={newCategory}
            onChange={handleNewCategory}
          />
          <AddButton variant="contained" onClick={addNewCategoryToList}>
            Add
          </AddButton>
        </CategoryRow>
      </CategoryRow>
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
            <CustomMenuItem value="AVAILABLE">Available</CustomMenuItem>
            <CustomMenuItem value="RETIRED">Retired</CustomMenuItem>
            <CustomMenuItem value="OUT_OF_STOCK">Out of stock</CustomMenuItem>
          </Select>
        </>
      )}
      <ButtonRow>
        <CancelButton variant="outlined" color="error" onClick={onClose}>
          Cancel
        </CancelButton>
        <CreateButton onClick={handleSubmit} variant="contained">
          Add Product
        </CreateButton>
      </ButtonRow>
    </>
  );
};
