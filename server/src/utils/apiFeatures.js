class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // Search
    search(fields = []) {
        if (this.queryString.search) {
            // Escape special regex characters to prevent MongoDB syntax errors / ReDoS
            const raw = String(this.queryString.search).trim();
            const safeKeyword = raw.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

            this.query = this.query.find({
                $or: fields.map(field => ({
                    [field]: {
                        $regex: safeKeyword,
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
        const limitParam = this.queryString.limit;
        if (
            limitParam === "all" ||
            limitParam === "ALL" ||
            limitParam === "unlimited" ||
            limitParam === "0"
        ) {
            this.query = this.query.limit(10000);
            return this;
        }

        const page = Math.max(Number(this.queryString.page) || 1, 1);
        const limit = Math.max(Number(limitParam) || 10, 1);
        const skip = (page - 1) * limit;

        this.query = this.query
            .skip(skip)
            .limit(limit);

        return this;
    }
}

export default ApiFeatures;
