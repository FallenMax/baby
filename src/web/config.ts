const env = process.env

const PARCEL_PORT = 1234
const port = Number(
  env.PORT
    ? env.PORT
    : // in develop mode, we use parcel to serve html and static resources at /public
    // but /api and /upload request must be sent to server record (not parcel's port)
    Number(location.port) === PARCEL_PORT
    ? 3333
    : location.port,
)

const hostname = env.HOST_NAME || location.hostname
const host = port ? `${hostname}:${port}` : hostname

export const config = {
  GA_ID: 'UA-84154809-5',
  host,
}
