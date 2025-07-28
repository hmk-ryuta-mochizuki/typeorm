import { expect } from "chai"
import "reflect-metadata"

import { DataSource } from "../../../src"
import {
    closeTestingConnections,
    createTestingConnections,
    reloadTestingDatabases,
} from "../../utils/test-utils"
import { Post } from "./entity/Post"

describe("github issues > #11579", () => {
    let dataSources: DataSource[]

    before(async () => {
        dataSources = await createTestingConnections({
            entities: [Post],
            enabledDrivers: ["mysql", "postgres", "sqlite"],
        })
    })
    beforeEach(() => reloadTestingDatabases(dataSources))
    after(() => closeTestingConnections(dataSources))

    it("Invalid SQL Generated When Deleting from Table with Column Named DELETE", async () => {
        const validSql: Record<string, string> = {
            mysql: "DELETE FROM `post`",
            postgres: 'DELETE FROM "typeorm_test"."post"',
            sqlite: 'DELETE FROM "post"',
        }

        await Promise.all(
            dataSources.map(async (dataSource) => {
                const repository = dataSource.getRepository(Post)
                const query = repository.createQueryBuilder().delete()
                expect(query.getSql()).to.equal(
                    validSql[dataSource.options.type],
                )
            }),
        )
    })
})
