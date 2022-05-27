import React, { ReactNode, useState, useEffect } from 'react';
import { MdRestartAlt } from 'react-icons/md';

type Props = {
  numItems: number;
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  prevButtonContent: JSX.Element | string;
  nextButtonContent: JSX.Element | string;
  onPageChanged: (newPage: number) => void;
  prefix?: string;
  showPages?: boolean;
  onReset?: () => void;
  children: ReactNode;
};

export default function Pager({
  numItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  prevButtonContent: prevButton,
  nextButtonContent: nextButton,
  onPageChanged,
  prefix,
  showPages,
  onReset,
  children,
}: Props) {
  //const [currentPage, setCurrentPage] = useState<number>(1);
  const [highestPage, setHighestPage] = useState<number>(99999);
  const [pageSize, setPageSize] = useState<number>(5);
  useEffect(() => {
    setPageSize(itemsPerPage <= 0 ? 5 : itemsPerPage);
    setHighestPage(numItems === 0 ? 1 : Math.ceil(numItems / pageSize));
  }, [pageSize, itemsPerPage, numItems]);
  function previous() {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPageChanged(newPage);
    }
  }
  function next() {
    if (currentPage < highestPage) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPageChanged(newPage);
    }
  }
  const pfx = prefix || 'pager';
  return (
    <div className={`${pfx}__container`}>
      <div className={`${pfx}__previous`}>
        <button
          type="button"
          className={`${pfx}__button ${pfx}__prevbutton`}
          onClick={previous}
          disabled={currentPage <= 1}
          title="Previous Page"
        >
          {prevButton}
        </button>
      </div>
      {showPages && (
        <div className={`${pfx}__pager`}>
          Page {currentPage} of {highestPage}
        </div>
      )}
      <div className={`${pfx}__content`}>{children}</div>
      {onReset && (
        <div className={`${pfx}__reset`}>
          <button
            className={`${pfx}__resetbutton`}
            onClick={onReset}
            title="Reload"
          >
            <span>
              <MdRestartAlt />
            </span>
          </button>
        </div>
      )}
      <div className={`${pfx}__next`}>
        <button
          type="button"
          className={`${pfx}__button ${pfx}__nextbutton`}
          onClick={next}
          disabled={currentPage >= highestPage}
          title="Next Page"
        >
          {nextButton}
        </button>
      </div>
    </div>
  );
}
