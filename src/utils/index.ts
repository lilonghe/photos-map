export function gps2Addr(longitude: string, latitude: string): Promise<string> {
    return gps2AddrDetail(longitude, latitude).then(res => res?.formatted_address)
}

export function gps2AddrDetail(longitude: string, latitude: string): Promise<any> {
    return new Promise((resolve) => {
        if (longitude) {
            fetch(`https://restapi.amap.com/v3/geocode/regeo?output=json&location=${longitude},${latitude}&key=ff15973c3f351d346d4482ca45258110&radius=1000&extensions=all`)
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