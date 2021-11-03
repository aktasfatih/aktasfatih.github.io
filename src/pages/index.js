import * as React from "react"
import {  graphql } from "gatsby"

import './index.css'
import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import { StaticImage } from "gatsby-plugin-image"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons'


const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <Seo title="All posts" />
        <Bio />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    )
  }

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="All posts" />
      {/* <Bio /> */}
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile-pic.png"
        width={150}
        height={150}
        style={{
          marginBottom: `1.45rem`, 
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",

        }}
        quality={95}
        alt="Profile picture"
      />
      <div style={{textAlign:'center'}}>
        Computer Engineering Graduate from the University of Alberta.
        <br />
        Currently working as a Software Engineer at <a href="https://www.lumnion.com/">Lumnion</a>.

      </div>
      <br />
      <br /> 
      
      <div style={{display: "flex", flexDirection: 'row', textAlign:'center', padding: "20px"}}>
        <a className="content" href="https://github.com/aktasfatih" >
          <div  className="activate" style={{flex:1, flexGrow:1 , verticalAlign:'center', padding: 10, textAlign:'center'}}>
            <FontAwesomeIcon icon={faGithub} style={{display: "inline-block", width: "50px", height: "50px"}}/>
            <div>
            github.com/aktasfatih
            </div>
          </div>
        </a>

        <a className="content" href="https://twitter.com/moreincode" >
          <div onClick={() => location.href='twitter.com/moreincode'} className="activate" style={{flex:1, flexGrow:1 , verticalAlign:'center', padding: 10, textAlign:'center'}}>
            <FontAwesomeIcon icon={faTwitter} style={{display: "inline-block", width: "50px", height: "50px"}}/>
            <div>
            twitter.com/moreincode
            </div>
          </div>
        </a> 

        <a className="content" href="https://www.linkedin.com/in/fatih-aktas/" >
          <div onClick={() => {location.href='linkedin.com/in/fatih-aktas/'}} className="activate" style={{flex:1, flexGrow:1 , verticalAlign:'center', padding: 10, textAlign:'center'}}>
            <FontAwesomeIcon icon={faLinkedin} style={{display: "inline-block", width: "50px", height: "50px"}} />
            <div>
              linkedin.com/in/fatih-aktas/
            </div>
          </div>
       </a> 
      </div>
      <span style={{fontSize:12}}>
        <b>Note:</b> Hey, I am currently working on this website. I will be adding more content. In the meantime, you could check out my<a href="http://www.twitter.com/moreincode"> twitter</a> or <a href = "mailto: abc@example.com">contact me</a> directly.
      </span>
      {/* <ol style={{ listStyle: `none` }}>
        {posts.map(post => {
          const title = post.frontmatter.title || post.fields.slug

          return (
            <li key={post.fields.slug}>
              <article
                className="post-list-item"
                itemScope
                itemType="http://schema.org/Article"
              >
                <header>
                  <h2>
                    <Link to={post.fields.slug} itemProp="url">
                      <span itemProp="headline">- {title}</span>
                    </Link>
                  </h2>
                  <small>{post.frontmatter.date}</small>
                </header>
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: post.frontmatter.description || post.excerpt,
                    }}
                    itemProp="description"
                  />
                </section>
              </article>
            </li>
          )
        })}
      </ol> */}
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
        }
      }
    }
  }
`
