import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from 'gatsby-image'
import style from '../styles/archive.module.css'


const useGallery = () => {
  const data = useStaticQuery(graphql`
  query AssetsPhotos {
    allFile(
      filter: {
        sourceInstanceName: {eq: "images"}, 
        dir: {regex: "/gallery/"}
      }) {
      nodes {
        id
        childImageSharp {
          fluid {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  }
  `);

  return data.allFile.nodes.map(node => ({
    ...node.childImageSharp, // Note that we're spreading the childImageSharp object here
    id: node.id,
  }));
};

const GalleryBlock = () => {
  const images = useGallery()
  return (

    <div className={style.gridList}>

      {images.map(({ id, fluid }) => (
        <Img key={id} fluid={fluid} />
      ))}

    </div>
  )
}

export default GalleryBlock
