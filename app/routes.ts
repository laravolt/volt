/**
 * Route contract shared by server and browser. Keys are route names; directories under
 * `app/actions/` mirror the nested map keys (auth, password, app).
 */
import { del, get, post, route } from 'remix/routes'

export const routes = route({
  assets: get('/assets/*path'),
  home: get('/'),

  auth: {
    loginPage: get('/login'),
    login: post('/login'),
    registerPage: get('/register'),
    register: post('/register'),
    logout: post('/logout'),
    googleRedirect: get('/google/redirect'),
    googleCallback: get('/google/callback'),
  },

  password: {
    forgotPage: get('/forgot-password'),
    forgot: post('/forgot-password'),
    resetPage: get('/reset-password/:token'),
    reset: post('/reset-password'),
  },

  app: {
    dashboard: get('/home'),
    profile: get('/profile'),
    changeProfile: post('/change-profile'),
    changePassword: post('/change-password'),
    deleteUsers: del('/users'),
  },
})
