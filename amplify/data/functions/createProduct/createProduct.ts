import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../resource';

const client = generateClient<Schema>();

export const handler: Schema['createProduct']['functionHandler'] = async (event) => {
  const {
    name,
    nameLowercase,
    description,
    price,
    quantity,
    category,
    images,
    attributes,
    status,
    slug,
    featured,
    tags,
    variants,
    supplier,
    storeId,
    owner,
  } = event.arguments;

  // Validaciones básicas
  if (!name || !nameLowercase || !category || !status || !storeId || !owner) {
    throw new Error('Invalid arguments');
  }

  // Generar slug si no se proporciona
  const finalSlug = slug || nameLowercase.replace(/\s+/g, '-').toLowerCase();

  // Preparar el objeto del producto
  const productData = {
    name,
    nameLowercase,
    description: description || '',
    price: price || 0,
    quantity: quantity || 0,
    category,
    images: images || [],
    attributes: attributes || {},
    status,
    slug: finalSlug,
    featured: featured || false,
    tags: tags || [],
    variants: variants || [],
    supplier: supplier || '',
    storeId,
    owner,
  };

  try {
    // Insertar el producto en la base de datos usando el cliente de Amplify
    const { data: createdProduct, errors } = await client.models.Product.create(productData);

    if (errors && errors.length > 0) {
      console.error('Error creating product in database:', errors);
      throw new Error(`Error creating product in database: ${errors.map((e) => e.message).join('; ')}`);
    }

    if (!createdProduct) {
      throw new Error('Failed to create product');
    }

    return {
      success: true,
      product: createdProduct,
      message: `Product "${name}" created successfully`,
    };
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw new Error(`Error creating product: ${error.message}`);
  }
};
