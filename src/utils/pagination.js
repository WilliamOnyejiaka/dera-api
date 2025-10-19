
export default function pagination(page, limit, totalRecords) {
    const totalPages = Math.ceil(totalRecords / limit);

    return {
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        totalPages,
        totalRecords,
    };
}