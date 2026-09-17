import React, { useState } from 'react';
import logo from '../assets/logo.svg';
import { logout } from '../firebase';

function Navigation({ onNavigate, currentPage, user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (page, e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
    closeMenu();
  };

  const handleLogout = async () => {
    await logout();
    setAvatarMenuOpen(false);
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const toggleAvatarMenu = () => {
    setAvatarMenuOpen(!avatarMenuOpen);
  };

  // Get user initials or first letter of email for avatar
  const getAvatarText = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav>
      <div className="nav__container">
        <img 
          className="logo" 
          src={logo} 
          alt="Logo" 
          onClick={(e) => handleNavClick('home', e)}
          style={{ cursor: 'pointer' }}
        />
        <ul className="nav__links">
          <li>
            <button 
              className={`nav__link ${currentPage === 'meal-planner' ? 'nav__link--active' : ''}`}
              onClick={(e) => handleNavClick('meal-planner', e)}
            >
              Meal Planner
            </button>
          </li>
          <li>
            <button 
              className={`nav__link ${currentPage === 'grocery-list' ? 'nav__link--active' : ''}`}
              onClick={(e) => handleNavClick('grocery-list', e)}
            >
              Grocery List
            </button>
          </li>
          <li>
            {user ? (
              <div className="user-avatar-container">
                <button 
                  className="user-avatar" 
                  onClick={toggleAvatarMenu}
                  aria-label="User menu"
                >
                  {getAvatarText()}
                </button>
                {avatarMenuOpen && (
                  <div className="avatar-dropdown">
                    <button 
                      className="avatar-dropdown-item"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        handleNavClick('meal-planner', null);
                      }}
                    >
                      Meal Planner
                    </button>
                    <button 
                      className="avatar-dropdown-item"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        handleNavClick('grocery-list', null);
                      }}
                    >
                      Grocery List
                    </button>
                    <button 
                      className="avatar-dropdown-item logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className={`nav__link ${currentPage === 'login' ? 'nav__link--active' : ''}`}
                onClick={(e) => handleNavClick('login', e)}
              >
                Login
              </button>
            )}
          </li>
        </ul>
        <button type="button" className="btn__menu" onClick={openMenu} aria-label="Open menu">
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className={`menu__backdrop ${menuOpen ? 'menu--open' : ''}`}>
          <button type="button" className="btn__menu btn__menu--close" onClick={closeMenu} aria-label="Close menu">
            <i className="fa-solid fa-times"></i>
          </button>
          <ul className="menu__links">
            <li className="menu__list">
              <button 
                className={`menu__link ${currentPage === 'meal-planner' ? 'menu__link--active' : ''}`}
                onClick={(e) => handleNavClick('meal-planner', e)}
              >
                Meal Planner
              </button>
            </li>
            <li className="menu__list">
              <button 
                className={`menu__link ${currentPage === 'grocery-list' ? 'menu__link--active' : ''}`}
                onClick={(e) => handleNavClick('grocery-list', e)}
              >
                Grocery List
              </button>
            </li>
            <li className="menu__list">
              {user ? (
                <>
                  <div className="mobile-user-info">
                    <div className="mobile-user-avatar">{getAvatarText()}</div>
                  </div>
                  <button 
                    className="menu__link logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  className={`menu__link ${currentPage === 'login' ? 'menu__link--active' : ''}`}
                  onClick={(e) => handleNavClick('login', e)}
                >
                  Login
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
