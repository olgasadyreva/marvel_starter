import { useState, useEffect, useRef, useCallback  } from "react";
import PropTypes from "prop-types";

import Spinner from "../spinner/Spinner";
import ErrorMessage from "../errorMessage/ErrorMessage";
import useMarvelService from "../../services/MarvelService";

import "./charList.scss";

const PAGE_SIZE = 9;

const CharList = (props) => {
  const [allChars, setAllChars] = useState([]);
  const [visibleChars, setVisibleChars] = useState([]);
  const [newItemLoading, setNewItemLoading] = useState(false);
  const [charEnded, setCharEnded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);


	//const marvelService = useRef(new useMarvelService()).current;
	// const {loading, error, getAllCharacters} = useRef(useMarvelService()).current;
  const isMounted = useRef(false);

	const { loading, error, getAllCharacters, clearError } = useMarvelService();


  useEffect(() => {
    isMounted.current = true;
    loadAllCharacters(true);

    return () => {
			isMounted.current = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllCharacters = async (initial) => {
			clearError();

			initial ? setNewItemLoading(false) : setNewItemLoading(true)
      const chars = await getAllCharacters();
      if (!isMounted.current) return;

      chars.sort((a, b) => a.id - b.id);
      const firstPage = chars.slice(0, PAGE_SIZE);
      const ended = chars.length <= PAGE_SIZE;

      setAllChars(chars);
      setVisibleChars(firstPage);
      setCurrentPage(1);
      setCharEnded(ended);
  };

  const loadMore = useCallback(() => {
    if (charEnded) return;

		setNewItemLoading(true);

    setTimeout(() => {
      const nextPage = currentPage + 1;
      const start = nextPage * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const newPortion = allChars.slice(start, end);

      const ended = end >= allChars.length;

      setVisibleChars((prev) => [...prev, ...newPortion]);
			setNewItemLoading(false);
      setCurrentPage(nextPage);
      setCharEnded(ended);
    }, 300);
  }, [allChars, currentPage, charEnded]);

	const itemRefs = useRef([]);

  const focusOnItem = (id) => {
		itemRefs.current.forEach(item => item.classList.remove('char__item_selected'));
		itemRefs.current[id].classList.add('char__item_selected');
		itemRefs.current[id].focus();
  }

  function renderItems(arr) {
    const items = arr.map((item, i) => {
      let imgStyle = { objectFit: "cover" };
      if (
        item.thumbnail ===
        "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg"
      ) {
        imgStyle = { objectFit: "unset" };
      }

      return (
        <li
          className="char__item"
					tabIndex={0}
					ref={el => itemRefs.current[i] = el}
          key={item.id}
          onClick={() => {
						props.onCharSelected(item.id);
					focusOnItem(i);
					}}
					onKeyDown={(e) => {
							if (e.key === ' ' || e.key === "Enter") {
									props.onCharSelected(item.id);
									focusOnItem(i);
							}
					}}>
          <img src={item.thumbnail} alt={item.name} style={imgStyle} />
          <div className="char__name">{item.name}</div>
        </li>
      );
    });

    return <ul className="char__grid">{items}</ul>;
  }

  const errorMessage = error ? <ErrorMessage /> : null;
  const spinner = loading && !newItemLoading ? <Spinner /> : null;
  // const content = !(loading || error) ? renderItems(visibleChars) : null;

  return (
    <div className="char__list">
      {errorMessage}
      {spinner}
			{renderItems(visibleChars)}
      <button
        className="button button__main button__long"
        disabled={newItemLoading}
        style={{ display: charEnded ? "none" : "block" }}
        onClick={loadMore}
      >
        <div className="inner">load more</div>
      </button>
    </div>
  );
};

CharList.propTypes = {
  onCharSelected: PropTypes.func.isRequired,
};

export default CharList;
