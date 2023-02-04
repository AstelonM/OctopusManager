import {useEffect, useState} from "react";
import {useHistory, useLocation} from "react-router-dom";

export default function useFilePath(): string|null {
  const [path, setPath] = useState(new URLSearchParams(useLocation().search).get("path"));
  const history = useHistory();
  useEffect(() => {
    return history.listen((location, action) => {
      setPath(new URLSearchParams(location.search).get("path"));
    });
  }, [history]);
  return path;
}
