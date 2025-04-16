const BASE_URL = 'https://service.lilonghe.net/proxy';

export function gps2Addr(longitude: string, latitude: string): Promise<string> {
    return gps2AddrDetail(longitude, latitude).then(res => res?.formatted_address)
}

export function gps2AddrDetail(longitude: string, latitude: string): Promise<any> {
    return new Promise((resolve) => {
        if (longitude) {
            fetch(BASE_URL + `/api/map/geocode/regeo?longitude=${longitude}&latitude=${latitude}`)
            .then(res => res.json())
            .then(data => {
                resolve(data?.regeocode)
            })
        }
    })
}

export function byte2Size(bytes: number): string {
    if (bytes < 1024) {
        return bytes.toFixed(1) + 'B'
    }
    bytes = bytes / 1024
    if (bytes < 1024) {
        return bytes.toFixed(1) + 'KB'
    }
    bytes = bytes / 1024
    return bytes.toFixed(1) + 'MB'
}