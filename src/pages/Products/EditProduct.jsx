import { useState, useContext, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ProductService from '../../services/ProductService'
import GalleryService from '../../services/GalleryService'
import { ProductContext } from '../../Providers/ProductContext'
import { TextBox, ComboBox, TextArea, ImageDrag, ImagesDrag, TagEdit } from '../../components/Inputs'
import AddCategory from './components/AddCategory'
import AddSize from './components/AddSize'
import AddColor from './components/AddColor'
import AddQuantity from './components/AddQuantity'
import ImageList from './components/ImageList'
import Modals from '../../components/Modals'
import { convertObjectToFormData } from '../../utils'
import config from '../../config'

function EditProduct() {
  const { brands, categories, sizes, colors, findCategoryById, findSizeById, findColorById } = useContext(ProductContext)
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const [product, setProduct] = useState()

  const navigate = useNavigate()
  const [image, setImage] = useState()
  const [images, setImages] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState(1000)
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [brandId, setBrandId] = useState('')
  const [isShowAlert, setIsShowAlert] = useState(false)
  const [message, setMessage] = useState('')
  const productId = query.get("productId")
  const [addImages, setAddImages] = useState([])
  const imagesUpload = useRef([])

  const [isOpenDialog, setIsOpenDialog] = useState(false)
  const [titleDialog, setTitleDialog] = useState('')
  const [componentDiglog, setComponentDialog] = useState()
  const [callbackDialog, setCallbackDialog] = useState()
  const dataDialog = useRef()
  const [listQuantity, setListQuantity] = useState([])

  const [isOpenConfirm, setIsOpenConfirm] = useState(false)
  const [messageConfirm, setMessageConfirm] = useState('')
  const [callbackConfirm, setCallbackConfirm] = useState()

  useEffect(() => {
    document.title = "S???a s???n ph???m"
    if (productId) {
      fetchApiGetProduct(productId)
    }
  }, [productId, sizes, colors])

  // L???y d??? li???u product v???
  const fetchApiGetProduct = async (productId) => {
    const result = await ProductService.getById(productId)

    if (result.success) {
      const product_ = result.data
      setProduct(product_)
      let listQuantity = await ProductService.getQuantityProductById(productId)
      listQuantity = listQuantity.data.map((item) => ({
        size: findSizeById(item.sizeId),
        color: findColorById(item.colorId),
        quantity: item.quantity
      }))
      setListQuantity(listQuantity)
      document.title = result.data.name
    }
    await fetchApiGetAllGalleryInProduct(productId)
  }

  const fetchApiGetAllGalleryInProduct = async (productId) => {
    const result = await GalleryService.getAllGalleryInProductById(productId)
    if (result.success) {
      setImages(result.data)
    }
  }

  // X??? l?? ch???nh s???a product
  const handleUpdate = async () => {
    const productUpdate = {
      productId: productId,
      name: name,
      price: price,
      description: description,
      slug: slug,
      brandId: brandId,
    }

    const result = await ProductService.updateById(productId, productUpdate, image)

    setMessage(result.data.message || result.data.title)
    setIsShowAlert(true)
  }

  // X??? l?? x??a danh m???c kh???i product
  const handleRemoveCategory = async (categoryId) => {
    const result = await ProductService.deleteCategoryById(productId, categoryId)
    if (result.success) {
      fetchApiGetProduct(productId)
    }
  }

  // X??? l?? th??m danh m???c cho product
  const handleAddCategory = () => {
    setTitleDialog("Th??m danh m???c cho s???n ph???m " + product.name)
    const component = <AddCategory categories={categories.filter(category => {
      for (let categoryId of product.categories) {
        if (category.categoryId === categoryId) {
          return false
        }
      }
      return true
    })} setCategoryIds={setDataDialog} />
    setComponentDialog(component)
    setCallbackDialog(() => async (status) => {
      if (status) {
        for (let categoryId of getDataDialog()) {
          await ProductService.addCategoryById(productId, categoryId)
        }
      }
      closeDialog()
    })
    setIsOpenDialog(true)
  }

  // X??? l?? x??a size kh???i product
  const handleRemoveSize = async (sizeId) => {
    if (product.detail.sizes.length <= 1) {
      setMessage("Kh??ng th??? x??a to??n b??? size")
      setIsShowAlert(true)
      return
    }
    const result = await ProductService.deleteSizeById(productId, sizeId)
    if (result.success) {
      fetchApiGetProduct(productId)
    }
  }

  // X??? l?? th??m size cho product
  const handleAddSize = () => {
    setTitleDialog("Th??m Size cho s???n ph???m " + product.name)
    const component = <AddSize sizes={sizes.filter(size => {
      for (let sizeId of product.detail.sizes) {
        if (size.sizeId === sizeId) {
          return false
        }
      }
      return true
    })} setSizeIds={setDataDialog} />
    setComponentDialog(component)
    setCallbackDialog(() => async (status) => {
      if (status) {
        for (let sizeId of getDataDialog()) {
          await ProductService.addSizeById(productId, sizeId)
        }
      }
      closeDialog()
    })
    setIsOpenDialog(true)
  }

  // X??? l?? x??a m??u kh???i product
  const handleRemoveColor = async (colorId) => {
    if (product.detail.colors.length <= 1) {
      setMessage("Kh??ng th??? x??a to??n b??? color")
      setIsShowAlert(true)
      return
    }
    const result = await ProductService.deleteColorById(productId, colorId)
    if (result.success) {
      fetchApiGetProduct(productId)
    }
  }

  // X??? l?? th??m m??u cho product
  const handleAddColor = () => {
    setTitleDialog("Th??m m??u cho s???n ph???m " + product.name)
    const component = <AddColor colors={colors.filter(color => {
      for (let colorId of product.detail.colors) {
        if (color.colorId === colorId) {
          return false
        }
      }
      return true
    })} setColorIds={setDataDialog} />
    setComponentDialog(component)
    setCallbackDialog(() => async (status) => {
      if (status) {
        for (let colorId of getDataDialog()) {
          await ProductService.addColorById(productId, colorId)
        }
      }
      closeDialog()
    })
    setIsOpenDialog(true)
  }

  const handleAddQuantity = async (sizeId, colorId, quantity) => {
    if (quantity <= 0 || quantity === '') {
      setMessage('Vui l??ng nh???p s??? l?????ng')
      setIsShowAlert(true)
      return
    }
    const result = await ProductService.addQuantityInSizeAndColor(productId, sizeId, colorId, quantity)
    if (result.success) {
      fetchApiGetProduct(productId)
    }
  }

  const handleAddImages = async () => {
    setTitleDialog("Th??m nhi???u ???nh cho s???n ph???m " + product.name)
    const component = <ImagesDrag files={addImages} setFiles={setAddImages} options={{ width: '500', height: '300' }} />
    setComponentDialog(component)
    setCallbackDialog(() => callbackAddImage)
    setIsOpenDialog(true)
  }

  const handleDeleteImage = (galleryId) => {
    setCallbackConfirm(() => async (status) => {
      setIsOpenConfirm(false)
      setCallbackConfirm(undefined)
      if (status) {
        const result = await GalleryService.deleteGalleryById(galleryId)

        if (result.success) {
          fetchApiGetAllGalleryInProduct(productId)
        } else {
          alert("C?? l???i x???y ra")
        }
      }
    })
    setMessageConfirm("Ch???c ch???n mu???n x??a ???nh n??y")
    setIsOpenConfirm(true)
  }

  useEffect(() => {
    imagesUpload.current = addImages
  }, [addImages])

  const callbackAddImage = async (status) => {
    if (status) {
      console.log(imagesUpload.current)
      await GalleryService.uploadImages(productId, imagesUpload.current)
    }
    setAddImages([])
    closeDialog()
  }

  const setDataDialog = (value) => dataDialog.current = value

  const getDataDialog = () => dataDialog.current

  const closeDialog = () => {
    fetchApiGetProduct(productId)
    setIsOpenDialog(false)
  }

  useEffect(() => {
    if (product) {
      setName(product.name)
      setSlug(product.slug)
      setDescription(product.description)
      setBrandId(product.brandId)
      setPrice(product.price)
    }
  }, [product])

  return (
    <div className="p-4">
      <div className="flex items-center mb-2">
        <Link className='mr-1 text-xl' to={config.routes.products}>S???n ph???m</Link>
        <h6 className='font-bold'>
          &gt; Ch??nh s???a
        </h6>
        <h6 className='font-bold'>
          &gt; {product ? product.name : ''}
        </h6>
      </div>
      <h5>Th??ng tin c?? b???n</h5>
      <div className="w-full flex flex-wrap border px-2">
        <div className="w-[48%] min-w-[300px] mr-[2%]">
          <TextBox title="T??n" value={name} placeholder="T??n s???n ph???m" onChange={setName} />

          <TextBox title="Gi??" value={price} onChange={setPrice} />

          <TextBox title="Slug" value={slug} placeholder='????? tr???ng s??? ???????c t???o ra t??? ?????ng'
            onChange={setSlug} />

          <ComboBox title="H??ng" options={brands} value={brandId} onChange={setBrandId}
            keyValueOption="brandId" keyTitleOption="name" />

          <TextArea title="M?? t???" value={description} onChange={setDescription} />
        </div>

        <div className="w-[48%] min-w-[300px] mr-[2%]">
          <ImageDrag title="???nh ch??nh" sourceLink={product ? config.urlImageProduct + product.image : ''}
            file={image} setFile={setImage} options={{ height: '52' }} />

          <div className="flex justify-end">
            <button
              onClick={handleUpdate}
              className="bg-ActiveColor px-2 rounded-full hover:opacity-70">
              C???p nh???t</button>
          </div>
        </div>
      </div>
      <h5>Chi ti???t</h5>

      {product ?
        <div className="w-full flex flex-wrap border px-2">
          <div className="w-[48%] min-w-[300px] mr-[2%]">
            <div className="flex my-2">
              <p className='font-bold'>Danh m???c</p>
              <div className="ml-2 flex flex-wrap">
                {product.categories.map((categoryId, index) => {
                  const category = categories.find(category => category.categoryId === categoryId)
                  if (category) {
                    return <TagEdit key={index} title={category.name} confirm={true}
                      message={`B???n c?? mu???n x??a danh m???c "${category.name}" kh???i s???n ph???m n??y kh??ng?`}
                      onClickRemove={() => handleRemoveCategory(categoryId)} />
                  }
                  return ''
                })}
              </div>
              <button disabled={product.categories.length === categories.length}
                className='disabled:opacity-70 bg-ActiveColor px-2 h-6 rounded-full hover:opacity-70 ml-2'
                onClick={handleAddCategory}>Th??m</button>
            </div>

            <div className="flex my-2">
              <p className='font-bold'>Sizes</p>
              <div className="ml-2 flex flex-wrap">
                {product.detail.sizes.map((sizeId, index) => {
                  const size = sizes.find(size => size.sizeId === sizeId)
                  if (size) {
                    return <TagEdit key={index} title={size.name} confirm={true}
                      message={`B???n c?? mu???n x??a size "${size.name}" kh???i s???n ph???m n??y kh??ng?`}
                      onClickRemove={() => handleRemoveSize(sizeId)} />
                  }
                  return ''
                })}
              </div>
              <button disabled={product.detail.sizes.length === sizes.length}
                className='disabled:opacity-70 bg-ActiveColor px-2 h-6 rounded-full hover:opacity-70 ml-2'
                onClick={handleAddSize}>Th??m</button>
            </div>

            <div className="flex my-2">
              <p className='font-bold'>M??u s???c</p>
              <div className="ml-2 flex flex-wrap">
                {product.detail.colors.map((colorId, index) => {
                  const color = colors.find(color => color.colorId === colorId)
                  if (color) {
                    return <TagEdit key={index} title={color.name} confirm={true}
                      message={`B???n c?? mu???n x??a m??u "${color.name}" kh???i s???n ph???m n??y kh??ng?`}
                      onClickRemove={() => handleRemoveColor(colorId)} />
                  }
                  return ''
                })}
              </div>
              <button disabled={product.detail.colors.length === colors.length}
                className='disabled:opacity-70 bg-ActiveColor px-2 h-6 rounded-full hover:opacity-70 ml-2'
                onClick={handleAddColor}>Th??m</button>
            </div>
            <div>
              <p className='font-bold my-2'>S??? l?????ng:</p>
              {listQuantity.map((item, index) => {
                return <AddQuantity key={index} size={item.size} color={item.color}
                  quantity={item.quantity} handlerAdd={handleAddQuantity} />
              })}
              <div className="my-2 font-bold flex">
                <p>T???ng s??? l?????ng s??n ph???m c??n l???i:</p>
                <p className="mx-2 -mt-2 text-3xl text-red-600"> {product ? product.totalQuantity : ''}</p>
                <p>S???n ph???m.</p>
              </div>
            </div>
          </div>

          <div className="w-[48%] min-w-[300px] mr-[2%]">
            <div className="flex justify-between mt-2">
              <p>Danh s??ch ???nh</p>
              <button
                className='disabled:opacity-70 bg-ActiveColor px-2 h-6 rounded-full hover:opacity-70 ml-2'
                onClick={handleAddImages}>Th??m</button>
            </div>
            <div>
              <ImageList onClickDelete={handleDeleteImage} images={images} />
            </div>
          </div>
        </div>
        : ''}
      <Modals.Alert message={message} isOpen={isShowAlert} handler={() => setIsShowAlert(false)} />
      <Modals.Confirm
        isOpen={isOpenConfirm}
        message={messageConfirm}
        handler={callbackConfirm} />
      <Modals.Dialog
        isOpen={isOpenDialog}
        setIsOpen={setIsOpenDialog}
        title={titleDialog}
        actionName="Th??m"
        handler={callbackDialog}
        children={componentDiglog}>
      </Modals.Dialog>
    </div>
  )
}
export default EditProduct
