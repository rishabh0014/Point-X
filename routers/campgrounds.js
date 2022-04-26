const express = require("express");
const campground = require("../models/campgrounds");
const middleWare = require("../middleware");

const router = express.Router();
router.get("/", (req, res) => {
  res.render("campgrounds/homepage");
});
router.get("/campgrounds", (req, res) => {
  try {
    async function getAllCampgrounds() {
      return await campground.find({});
    }
    async function renderCampgrounds() {
      const campgrounds = await getAllCampgrounds();
      res.render("campgrounds/index", {
        campgrounds: campgrounds,
        user: req.user
      });
    }

    renderCampgrounds();
  } catch (err) {
    req.flash("error", err);
    res.redirect("/");
  }
});
router.post("/campgrounds", (req, res) => {
  async function createCampground() {
    return await campground.create(req.body.obj);
  }
  createCampground()
    .then(newlyCreatedCampground => {
      newlyCreatedCampground.createdBy.id = req.user._id;
      newlyCreatedCampground.createdBy.username = req.user.username;
      newlyCreatedCampground.save();
      req.flash("success", "Campground Created Successfully :)");
      res.redirect("/campgrounds");
    })
    .catch(err => {
      req.flash("error", "There was some error in creating the campground");
    });
});
router.get("/campgrounds/new", middleWare.isLoggedIn, (req, res) => {
  res.render("new");
});
router.get("/campgrounds/:id/edit", middleWare.checkOwnership, (req, res) => {
  try {
    async function findUser() {
      return await campground.findById(req.params.id);
    }
    findUser()
      .then(result => {
        console.log("Found the user");
        res.render("campgrounds/update", {
          camp: result
        });
        req.flash("error", "Oops! Campground not found");
      })
      .catch(err => {
        req.flash("error", err);
      });
  } catch (err) {
    req.flash("error", err);
  }
});
router.put("/campgrounds/:id", middleWare.checkOwnership, (req, res) => {
  try {
    async function updateCampground() {
      return await campground.findByIdAndUpdate(req.params.id, req.body.obj);
    }

    updateCampground()
      .then(c => {
        req.flash("success", "Updated");
        res.redirect(`/campgrounds/${req.params.id}`);
      })
      .catch(err => {
        req.flash("error", "Could not update campground ");
        res.redirect(`/campgrounds/${req.params.id}`);
      });
  } catch (err) {
    req.flash("error", "Could not update campground ");
  }
});
router.delete("/campgrounds/:id", middleWare.checkOwnership, (req, _res) => {

  async function deleteCampground() {
    return await campground.findByIdAndDelete(req.params.id);
  }

  deleteCampground().then(result => {
    req.flash("success", "Successfully deleted a campground");
    _res.redirect("/campgrounds");
  });
});

router.get("/campgrounds/:id", (req, res) => {
  try {
    async function getCampground() {
      return await campground
        .findById(req.params.id)
        .populate("comment")
        .exec();
    }
    getCampground()
      .then(camp => {
        console.log("Called");
        res.render("campgrounds/show", {
          camp,
          user: req.user
        });
      })
      .catch(err => {
        res.render("notFound");
      });
  } catch (err) {
    res.render("notFound");
  }
});
module.exports = router;
