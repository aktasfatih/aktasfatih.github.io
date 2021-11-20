import * as React from "react"
import {  graphql } from "gatsby"

import './index.css'
import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import { StaticImage } from "gatsby-plugin-image"
import Helmet from "react-helmet"
import { withPrefix, Link } from "gatsby"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faLinkedin, faTwitter, faStackOverflow } from '@fortawesome/free-brands-svg-icons'

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
      <Helmet>
        <script src={withPrefix('metaballs.js')} type="text/javascript" />
      </Helmet>
      <div class="container">
        <Seo title="All posts" />
        {/* <Bio /> */}
        <div className="flexCenter applyWidth">
          <img
            className="bio-avatar"
            id="profilePicture"
            layout="fixed"
            formats={["auto", "webp", "avif"]}
            src="profile-pic.png"
            width={200}
            height={200}
            quality={95}
            alt="Profile picture"
          />
          <span style={{ textAlign: 'left' }}>
              Hi there!
              <br />
              <br />
              I'm a Computer Engineer from the University of Alberta.
              <br />
              I currently work as a Software Engineer at <a href="https://www.lumnion.com/">Lumnion</a>.
          </span >
          
        </div>

        <div style={{ display: "flex", justifyContent: 'space-around', flexDirection: 'row', textAlign: 'center', padding: "20px" }}>
          <a className="content" target="_blank" href="https://github.com/aktasfatih" >
            <div className="activate" style={{ flex: 1, flexGrow: 1, verticalAlign: 'center', padding: 10, textAlign: 'center' }}>
              <FontAwesomeIcon icon={faGithub} style={{ display: "inline-block", width: "50px", height: "50px" }} />
              <div>
                github.com/aktasfatih
              </div>
            </div>
          </a>
          <a className="content" target="_blank" href="https://stackoverflow.com/users/5027899/fatih-akta%c5%9f" >
            <div className="activate" style={{ flex: 1, flexGrow: 1, verticalAlign: 'center', padding: 10, textAlign: 'center' }}>
              <FontAwesomeIcon icon={faStackOverflow} style={{ display: "inline-block", width: "50px", height: "50px" }} />
              <div>
                stackoverflow.com
              </div>
            </div>
          </a>
        </div>

        <div style={{ display: "flex", flexDirection: 'row', justifyContent: 'space-around', textAlign: 'center', padding: "20px" }}>
          <a className="content" target="_blank" href="https://twitter.com/moreincode" >
            <div onClick={() => location.href = 'twitter.com/moreincode'} className="activate" style={{ flex: 1, flexGrow: 1, verticalAlign: 'center', padding: 10, textAlign: 'center' }}>
              <FontAwesomeIcon icon={faTwitter} style={{ display: "inline-block", width: "50px", height: "50px" }} />
              <div>
                twitter.com/moreincode
              </div>
            </div>
          </a>

          <a className="content" target="_blank" href="https://www.linkedin.com/in/fatih-aktas/" >
            <div onClick={() => { location.href = 'linkedin.com/in/fatih-aktas/' }} className="activate" style={{ flex: 1, flexGrow: 1, verticalAlign: 'center', padding: 10, textAlign: 'center' }}>
              <FontAwesomeIcon icon={faLinkedin} style={{ display: "inline-block", width: "50px", height: "50px" }} />
              <div>
                linkedin.com/in/fatih-aktas/
              </div>
            </div>
          </a>
        </div>
        <div className="flexCenter applyWidth">
          
        </div>
        {/* <div className="flexCenter">
          <span style={{ textAlign:'left'}}>
            Here are some things I've written:
          </span>
        </div> */}
        {/* <span style={{ fontSize: 12 }}>
          <b>Note:</b> Hey, I am currently working on this website. I will be adding more content. In the meantime, you could check out my<a href="http://www.twitter.com/moreincode"> twitter</a> or <a href="mailto: akfatih2@gmail.com">contact me</a> directly.
        </span> */}
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
      </div>
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
