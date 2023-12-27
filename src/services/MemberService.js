import { API_URL } from '@/util/constant'
import jsCookie from 'js-cookie'

const MemberService = {
    login({ id, password }) {
        return fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, password })
        }).then((res) => res.json())
    },

    register({ id, name, password, email, phone }) {
        return fetch(`${API_URL}/member`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jsCookie.get('access_token')
            },
            body: JSON.stringify({ id, name, password, email, phone })
        }).then((res) => res.json())
    },

    getMemberInfo() {
        return fetch(`${API_URL}/member/info`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jsCookie.get('access_token')
            }
        }).then((res) => res.json())
    },

    updateProfile(payload) {
        return fetch(`${API_URL}/member/info/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jsCookie.get('access_token')
            },
            body: JSON.stringify(payload)
        }).then((res) => res.json())
    },

    updateMemberInfo(memberNo, payload) {
       /* Should to create http request file to config authen  token, header, method, param, refresh token,...*/
        return fetch(`${API_URL}/member/${memberNo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jsCookie.get('access_token')
            },
            body: JSON.stringify(payload)
        }).then((res) => res.json())
    },

    deleteMember(memberNo) {
          /* Should to create http request file to config authen  token, header, method, param, refresh token,...*/
        return fetch(`${API_URL}/member/${memberNo}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jsCookie.get('access_token')
            },
        }).then((res) => res.json())
    },    

    search({ id, name, phone, fromDate, toDate, page = 1, size = 5, sort, direction = 'asc' }) {
        return fetch(`${API_URL}/member/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jsCookie.get('access_token')
            },
            body: JSON.stringify({ id, name, phone, fromDate, toDate, page, size, sort, direction })
        }).then((res) => res.json())
    },

    exportExcel({ id, name, phone, fromDate, toDate, page = 1, size = 5, sort, direction = 'asc' }) {
        return fetch(`${API_URL}/member/export-excel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jsCookie.get('access_token')
            },
            body: JSON.stringify({ id, name, phone, fromDate, toDate, page, size, sort, direction })
        }).then((res) => {
            if (!res.ok) {
                return res.json()
            }
            let fileName = res.headers.get('Content-Disposition').split('filename=')[1]
            return res.blob().then((blob) => ({
                success: true,
                message: 'Successfull',
                status: res.status,
                statusCode: res.statusText,
                data: { blob, fileName }
            }))
        })
    }
}

export default MemberService
