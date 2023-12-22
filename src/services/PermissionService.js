import { API_URL } from '@/util/constant'
import jsCookie from 'js-cookie'

const PermissionService = {
    findAll() {
        return fetch(`${API_URL}/permission/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jsCookie.get('access_token')
            }
        }).then((response) => response.json())
    }
}

export default PermissionService
