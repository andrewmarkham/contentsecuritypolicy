import React, { useEffect, useState} from 'react';
import { Navigation} from "@episerver/platform-navigation";

export const AppNavigation = ({ history }) => {
    const [menuItems, setMenuItems] = useState([]);

    const [actionItems, setActionItems] = useState([]);

    const [product, setProduct] = useState({"id":"global_cms","name":"CMS","url":"/EPiServer/CMS/","target":null,"children":null});
    const [products, setProducts] = useState([]);
    
    useEffect(() => {

        const getPlatformNavigation = () => {

            fetch("/EPiServer/Shell/epiplatformnavigation?product=global_cms")
             .then(response => response.json())
             .then(data => 
                 {
                    var mi = data.menuItems;
                    var ai = data.actionItems;

                    setMenuItems(mi);
                    setActionItems(ai);
                 }); 
            
             fetch("/EPiServer/Shell/epiproducts")
              .then(response => response.json())
              .then(data => 
                     {
                        var products = data.products;
    
                        setProducts(products)
                        if (products.length > 0) {
                            setProduct(products[0]);
                        }

                     }); 
        };

        getPlatformNavigation();

    }, []);

    return (
        <Navigation menuItems={menuItems} 
            onItemSelect={() => {}} 
            onProductSelect = {() => {}}
            onActionItemSelect = {() => {}}
            product={product} 
            products={products} 
            actionItems={actionItems}>
        </Navigation>
    );
};