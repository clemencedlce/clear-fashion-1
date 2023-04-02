// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/
Search for specific products
This endpoint accepts the following optional query string parameters:
- `page` - page of products to return
- `size` - number of products to return
GET https://clear-fashion-api.vercel.app/brands
Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};
let brandsCount = 0;
let p50 = 0;
let p90 = 0;
let p95 = 0;


// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const selectBrand=document.querySelector("#brand-select");
const recentlyReleased = document.querySelector("#recently-released");
const reasonablePrice = document.querySelector("#reasonable-price");
const sortproduct = document.querySelector("#sort-select");
const spanNbProductsnew = document.querySelector('#nbNewProducts');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @param brand - all : display all the brands 
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12, brand ="all", sort_type="price-asc", filter_recent = false, filter_price = false) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`+ (brand !== "all" ? `&brand=${brand}` : "")
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }
    
    var result=body.data.result;
    console.log(Array.isArray(result));
      
    console.log(Array.isArray(result));
    if (filter_recent){
      result = result.filter(product => (new Date() - new Date(product.released)) / (1000 * 60 * 60 * 24) < 50);
    }
    if (filter_price){  
      result=result.filtre(product=>product.price<50);
    }
    
    var meta = {
      currentPage: page,
      pageCount: Math.ceil(result.length / size),
      pageSize: size,
      count: result.length
    };
      
    /** Number of brands **/ 
    if(result.length > 0){
      result.reduce((acc, product) => {
        if(!acc[product.brand]) {
          acc[product.brand] = 1;
          brandsCount++;
        }
        return acc;
      }, {});
    };
    
    /** Feature 10 : p50, p90 and p95 price value indicator**/ 
    if(result.length > 0)
    {
      p50 = [...result].sort((a, b) => a.price - b.price)[Math.floor(result.length / 2)].price;
      p90 = [...result].sort((a, b) => a.price - b.price)[Math.floor(result.length * 0.9)].price;
      p95 = [...result].sort((a, b) => a.price - b.price)[Math.floor(result.length * 0.95)].price;
    }
    else
    {
      p50 = 0;
      p90 = 0;
      p95 = 0;
    }

     
    return {result,meta};

    /*return body.data;*/ 
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/** 
* Fetch Brands
*/
const fetchBrand = async ()=> {
  try {
    const response = await fetch(
      'https://clear-fashion-api.vercel.app/brands'
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
    }
    else {
      var brands=body.data.result;
      brands.unshift("all")
      renderBrands(brands) 
    }
    return body.data;
  } catch (error) {
    console.error(error);
 
  }
};


/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
        <span>${product.released}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/** Render Brand selector
* @param {Array} brands
*/ 

const renderBrands = brands => {
    brands =  [...new Set(currentProducts.map(product => product.brand))];
    const options = brands
    .map(brand => `<option value="${brand}">${brand}</option>`)
    .join('');
    
    selectBrand.innerHTML = `<option value="">All brands</option>${options}`;
}


/** Render Brands Count 
*/ 

const renderBrandsCount = () => {
  const spanNbBrands = document.querySelector('#nbBrands');
  spanNbBrands.innerHTML = brandsCount;
};

/** Render p50, p90, p95 
*/ 

const renderStats = () => {
  const spanP50 = document.querySelector('#spanP50');
  spanP50.innerHTML = p50;
  const spanP90 = document.querySelector('#spanP90');
  spanP90.innerHTML = p90;
  const spanP95 = document.querySelector('#spanP95');
  spanP95.innerHTML = p95;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;
  
  /** Feature 8 : Number of products **/ 
  spanNbProducts.innerHTML = count;
    
  
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderBrands(brand);
  renderBrandsCount();
};



/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), parseInt(selectShow.value));

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

/** Feature 2 : filter product by brands **/ 

const filterProductsByBrand = brand => {
  const filteredProducts = currentProducts.filter(product => product.brand === brand);
  render(filteredProducts, {currentPage: 1, count: filteredProducts.length, pageCount: 1});
};

selectBrand.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(selectPage.value), parseInt(selectShow.value), event.target.value);
  console.log(products);
  const res = products.result;


  setCurrentProducts(products);
  render(currentProducts, currentPagination);

});

/** Feature 3 : filter products by Recent products 
A recent product is less than 2 weeks
**/


if (recentlyReleased){
  recentlyReleased.addEventListener('change',async (event)=>{
  const products=await fetchProducts(currentPagination.currentPage,currentPagination.pageCount,selectBrand.value,event.target.checked,reasonablePrice.checked,sortproduct);
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});}



/** Feature 4 : Filter by reasonable price 
A reasonable price is less than 50$
**/

if (reasonablePrice){
  reasonablePrice.addEventListener('change',async (event)=>{
  const products=await fetchProducts(currentPagination.currentPage,currentPagination.pageCount,selectBrand.value,recentlyReleased.checked,event.target.checked,sortproduct);
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});}

/** Feature 5 : Sort by Price  
        ** AND **
/** Feature 6 : sort by date **/ 

const sortProducts = (sortOption) => {
  let sortedProducts=[...currentProducts];

  switch(sortOption) {
    case 'price-asc':
      sortedProducts.sort((a,b) => a.price - b.price);
      break;
    case 'price-desc':
      sortedProducts.sort((a,b) => b.price - a.price);
      break;
    
    case 'date-asc':
        sortedProducts.sort((a,b) => a.released - b.released);
       
        break;
      case 'date-desc':
        sortedProducts.sort((a,b) => b.released - a.released);
          break;
        default:
          break;
  }
  render(sortedProducts, {currentPage: 1, count: sortedProducts.length, pageCount: 1})
};

const selectSort=document.querySelector('#sort-select');


selectSort.addEventListener('change', async (event) => {
  const selectedSort = selectSort.value;
  sortedProduct=sortProducts(selectedSort);
  products.result=sortedProduct.result;

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

/** Feature 9 : number of recent products indicator **/

