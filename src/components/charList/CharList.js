import { Component } from "react";
import Spinner from "../spinner/Spinner";
import ErrorMessage from "../errorMessage/ErrorMessage";
import MarvelService from "../../services/MarvelService";
import "./charList.scss";

const PAGE_SIZE = 9;

class CharList extends Component {
  state = {
    allChars: [],
    visibleChars: [],
    loading: true,
    error: false,
    newItemLoading: false,
    currentPage: 0,
    charEnded: false,
  };

  marvelService = new MarvelService();
  _isMounted = false;

  componentDidMount() {
    if (!this._isMounted) {
      this._isMounted = true;
      this.loadAllCharacters();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  loadAllCharacters = async () => {
    try {
      this.setState({ loading: true });
      const chars = await this.marvelService.getAllCharacters();
      if (!this._isMounted) return;

      chars.sort((a, b) => a.id - b.id); // опционально
      const firstPage = chars.slice(0, PAGE_SIZE);
      const ended = chars.length <= PAGE_SIZE;

      this.setState({
        allChars: chars,
        visibleChars: firstPage,
        loading: false,
        currentPage: 1,
        charEnded: ended,
      });
    } catch (err) {
      if (this._isMounted) {
        this.setState({ error: true, loading: false });
      }
    }
  };

  loadMore = () => {
    const { allChars, currentPage, charEnded } = this.state;
    if (charEnded) return;

    this.setState({ newItemLoading: true });

    setTimeout(() => {
      const nextPage = currentPage + 1;
      const start = (nextPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const newPortion = allChars.slice(start, end);

      const ended = end >= allChars.length;

      this.setState((prev) => ({
        visibleChars: [...prev.visibleChars, ...newPortion],
        newItemLoading: false,
        currentPage: nextPage,
        charEnded: ended,
      }));
    }, 300);
  };

  renderItems(arr) {
    const items = arr.map((item) => {
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
          key={item.id}
          onClick={() => this.props.onCharSelected(item.id)}
        >
          <img src={item.thumbnail} alt={item.name} style={imgStyle} />
          <div className="char__name">{item.name}</div>
        </li>
      );
    });

    return <ul className="char__grid">{items}</ul>;
  }

  render() {
    const { visibleChars, loading, error, newItemLoading, charEnded } =
      this.state;

    const errorMessage = error ? <ErrorMessage /> : null;
    const spinner = loading ? <Spinner /> : null;
    const content = !(loading || error) ? this.renderItems(visibleChars) : null;

    return (
      <div className="char__list">
        {errorMessage}
        {spinner}
        {content}
        <button
          className="button button__main button__long"
          disabled={newItemLoading}
          style={{ display: charEnded ? "none" : "block" }}
          onClick={this.loadMore}
        >
          <div className="inner">load more</div>
        </button>
      </div>
    );
  }
}

export default CharList;
