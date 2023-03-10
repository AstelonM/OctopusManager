import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";

export default function useFilePath(): string|null {
  const location = useLocation();
  const [path, setPath] = useState(new URLSearchParams(location.search).get("path"));
  useEffect(() => {
    setPath(new URLSearchParams(location.search).get("path"));
  }, [location]);
  return path;
}
