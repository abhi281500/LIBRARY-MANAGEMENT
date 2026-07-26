class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // Search
    search(fields = []) {
        if (this.queryString.search) {

            const keyword = this.queryString.search;

            this.query = this.query.find({
                $or: fields.map(field => ({
                    [field]: {
                        $regex: keyword,
                        $options: "i"
                    }
                }))
            });

        }

        return this;
    }

    // Filter
    filter() {

        const queryObj = { ...this.queryString };

        const removeFields = [
            "search",
            "page",
            "limit",
            "sortBy",
            "order"
        ];

        removeFields.forEach(field => delete queryObj[field]);

        this.query = this.query.find(queryObj);

        return this;
    }

    // Sorting
    sort() {

        const sortBy = this.queryString.sortBy || "createdAt";

        const order =
            this.queryString.order === "asc"
                ? 1
                : -1;

        this.query = this.query.sort({
            [sortBy]: order
        });

        return this;
    }

    // Pagination
    paginate() {

        const page = Number(this.queryString.page) || 1;

        const limit = Number(this.queryString.limit) || 10;

        const skip = (page - 1) * limit;

        this.query = this.query
            .skip(skip)
            .limit(limit);

        return this;
    }

}

export default ApiFeatures;