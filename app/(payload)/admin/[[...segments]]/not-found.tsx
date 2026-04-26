import config from "../../../../src/payload.config"
import { NotFoundPage } from "@payloadcms/next/views"
import { importMap } from "../importMap.js"

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}

const NotFound = (args: Args) => NotFoundPage({ ...args, config, importMap })

export default NotFound
