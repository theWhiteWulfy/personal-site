import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'

import style from '../styles/menu.module.css'

const MainMenu = ({ mainMenu }) => {
  const menu = mainMenu.slice(0)

  const items = menu.map((menuItem, index) => (
    <li key={index} className={style.primaryMenuItem}>
      <Link
        to={menuItem.path}
        itemProp="url"
        activeStyle={{ textDecoration: 'line-through' }}
        partiallyActive
      >
        {menuItem.title}
      </Link>
    </li>
  ))

  return <ul className={style.primaryMenu}>{items}</ul>
}

const Menu = ({ mainMenu, onChangeTheme }) => {
  return (
    <>
      <nav
        id="nav-primary"
        itemScope
        itemType="http://schema.org/SiteNavigationElement"
        aria-label="Primary navigation"
        className={style.primaryNavigation}
      >
        <MainMenu mainMenu={mainMenu} />
      </nav>
      <div className={style.siteControls}>
        <button
          className={style.themeToggle}
          onClick={onChangeTheme}
          type="button"
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          <span className={style.themeToggleInner}>
            <span className={style.themeToggleIcon} />
          </span>
        </button>
      </div>
    </>
  )
}

Menu.propTypes = {
  mainMenu: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      path: PropTypes.string,
    })
  ),
  onChangeTheme: PropTypes.func,
}

export default Menu
