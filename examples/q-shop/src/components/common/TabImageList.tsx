import CSS from 'csstype';
import React, {useState} from "react";

export interface TabImageListProps {
    divStyle?:CSS.Properties,
    imgStyle?:CSS.Properties,
    images: string[]|undefined
}
const TabImageList = ({divStyle={}, imgStyle={}, images}: TabImageListProps) => {

    if (images) {
        const [mainImage, setMainImage] = useState<string>(images[0])
        const [imageFocusedIndex, setImageFocusedIndex] = useState<number>(0)

        const mainImageStyle = {width:'80%', marginLeft:'10%', marginRight:'10%', aspectRatio:'1 / 1'}
        const imageRowStyle = {display: 'grid', gridTemplateColumns: `repeat(${images.length}, 1fr)`,
            width:'100%', marginTop: '10px'}
        const imageTabStyle = {width:'50%', aspectRatio:'1 / 1', marginLeft: '25%' }
        const imageTabOutlineStyle = {...imageTabStyle, outline: '4px solid #1196AB'} // alt outline color: #03A9F4
        const switchMainImage = (index: number) => {
            setMainImage(images[index])
            setImageFocusedIndex(index)
        }
            const imageRow = images.length > 1 ? images.map( (image,index)=>
                <img style={imageFocusedIndex === index ? imageTabOutlineStyle:imageTabStyle}
                     src={image} alt={`Image #${index}`} onClick={() => switchMainImage(index)}/>):<div/>


        const defaultStyle = {width: '100%'}
        return (<div>
            <div style={{...defaultStyle, ...divStyle}}>
                <img style={{...mainImageStyle, ...imgStyle}} src={mainImage} alt='No product image found'/>
            </div>
                    <div style={imageRowStyle}>
                        {imageRow}
                </div>
            </div>
            )
    }
    else{return <div/>}


}

export default TabImageList