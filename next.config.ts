import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pins the workspace root to this directory - without it, Turbopack
  // walks up looking for a lockfile and can land on an unrelated one
  // elsewhere in the user's home directory.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
