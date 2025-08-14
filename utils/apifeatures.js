class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const hasKeyword = typeof this.queryStr.keyword === "string" && this.queryStr.keyword.trim() !== "";
    if (hasKeyword) {
      const keyword = {
        $or: [
          {
            giftCardName: {
              $regex: this.queryStr.keyword,
              $options: "i",
            },
          },
          {
            description: {
              $regex: this.queryStr.keyword,
              $options: "i",
            },
          },
          {
            giftCardTag: {
              $regex: this.queryStr.keyword,
              $options: "i",
            },
          },
        ],
      };

      this.query = this.query.find(keyword);
    }

    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;
