import React, {useLayoutEffect, useRef} from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import {LineType} from "../Utils";

type Props = {
  lines: LineType[]
}

function isScrolled(scrollable: HTMLDivElement): boolean {
  return scrollable.scrollHeight - scrollable.clientHeight <= scrollable.scrollTop + 1;
}

export default function Console({lines}: Props) {
  const scrollable = useRef<HTMLDivElement>(null);
  const scrolled = scrollable.current !== null ? isScrolled(scrollable.current) : false;

  useLayoutEffect(() => {
    if (scrollable.current !== null) {
      const scrollableItem = scrollable.current;
      scrollableItem.scrollTop = scrollableItem.scrollHeight - scrollableItem.clientHeight;
    }
  }, []);

  useLayoutEffect(() => {
    if (scrollable.current !== null && scrolled) {
      const scrollableItem = scrollable.current;
      scrollableItem.scrollTop = scrollableItem.scrollHeight - scrollableItem.clientHeight;
    }
  }, [lines, scrolled]);

  return (
    <Card.Body>
      <ListGroup className="console d-flex flex-column border" ref={scrollable}>
        {lines.length === 0 ? <p className="console-line">The console is empty.</p> :
        lines.map(line => (
          <span className="console-line" key={line.id}>{line.text}</span>
        ))}
      </ListGroup>
    </Card.Body>
  );
}
