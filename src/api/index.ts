import UsersService from './users'
import CategoriesService from './categories'
import CatsService from './cats'
import ArticlesService from './articles'
import SecurityService from './security'
import PostsService from './posts'
import FootprintsService from './footprints'

export const Users = new UsersService()
export const Categories = new CategoriesService()
export const Cats = new CatsService()
export const Articles = new ArticlesService()
export const Security = new SecurityService()
export const Posts = new PostsService()
export const Footprints = new FootprintsService()
