import { createContext, useEffect, useState } from 'react';
import BrandService from '../services/BrandService'
import ColorService from '../services/ColorService'
import CategoryService from '../services/CategoryService'
import SizeService from '../services/SizeService'

const ProductContext = createContext();


const ProductContextProvider = ({ children }) => {
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {

    fetchApiGetAllSize()
    fetchApiGetAllBrand()
    fetchApiGetAllColor()
    fetchApiGetAllCategory()
  }, [])

  const fetchApiGetAllCategory = async () => {
    const result = await CategoryService.getAll()
    setCategories(result.data)
  }

  const fetchApiGetAllBrand = async () => {
    const result = await BrandService.getAll()
    setBrands(result.data)
  }

  const fetchApiGetAllSize = async () => {
    const result = await SizeService.getAll()
    setSizes(result.data)
  }

  const fetchApiGetAllColor = async () => {
    const result = await ColorService.getAll()
    setColors(result.data)
  }

  return (
    <ProductContext.Provider value={{
      brands,
      categories,
      colors,
      sizes
    }}>
      {children}
    </ProductContext.Provider>
  )
}

export { ProductContext, ProductContextProvider }

