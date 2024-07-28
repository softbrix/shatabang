"use strict"
import assert from 'assert';
import * as chaiModule from "chai";
import chaiHttp from 'chai-http';

const chai = chaiModule.use(chaiHttp);

describe('List directory module', function() {
    it('processDirectory', function() {
        DirectoryList.processDirectory('1920', './test/test_data', './test/test_data');
    });
});