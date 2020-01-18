import fetch from '../util/fetch-fill';
import URI from 'urijs';


window.path = 'http://localhost:3000/records';

const PrimaryColors = ['red', 'blue', 'yellow'];
const getPreviousPage = (page) => page > 1 ? page - 1 : null;
const getNextPage = (page, isMoreThanTen) => isMoreThanTen ? page + 1 : null;
const getIds = (records) => records.map((record) => record.id);
const getOpen = (records) => records.filter((record) => record.disposition === 'open');
const getClosedPrimaryCount = (records) => records.filter((record) => record.disposition === 'closed' && PrimaryColors.includes(record.color)).length;
const updateOpenForPrimary = (records) => records.map((record) => {
  const includesPrimary = PrimaryColors.includes(record.color);
  return { ...record, isPrimary: includesPrimary }
})

const formatResponse = ({ currentPage, data }) => {

  const isMoreThanTen = data.length > 10;
  const records = isMoreThanTen ? data.slice(0, 10) : data;
  const previousPage = getPreviousPage(currentPage);
  const nextPage = getNextPage(currentPage, isMoreThanTen);
  const ids = getIds(records);
  const openList = getOpen(records);
  const open = updateOpenForPrimary(openList);
  const closedPrimaryCount = getClosedPrimaryCount(records);

  return {
    previousPage,
    nextPage,
    ids,
    open,
    closedPrimaryCount,
  }

}

const fetchData = async ({ URL, currentPage }) => {

  const response = await fetch(URL, {
    method: 'GET',
  });

  if (!response.ok) {
    console.log('response error');
    return;
  }

  const data = await response.json();

  return formatResponse({
    currentPage,
    data,
  });

}

const retrieve = async (options = {}) => {

  try {

    // Set Default Options 

    const currentPage = options.page || 1;
    const limit = 11;
    const query = {
      limit,
      offset: (currentPage - 1) * (limit - 1),
      "color[]": []
    }

    if (Array.isArray(options.colors)) {
      options.colors.forEach((color) => {
        query["color[]"].push(color);
      })
    }

    // Fetch

    const queryStrings = URI.buildQuery(query);
    return await fetchData({ URL: `${window.path}?${queryStrings}`, currentPage });

  } catch (error) {
    console.log(error);
  }

}

export default retrieve;