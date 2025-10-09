import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    formatMessageWithValues, withModulesManager, withHistory,decodeId
} from "@openimis/fe-core";
import ContributionForm from "../components/ContributionForm";
import { createContribution, fetchPremiumValue, updateContribution } from "../actions";
import { RIGHT_CONTRIBUTION_EDIT } from "../constants";

const styles = theme => ({
    page: theme.page,
});

class ContributionPage extends Component {


    save = async (contribution) => {
        
        if (!contribution.uuid) {
            const response = await this.props.createContribution(
                this.props.modulesManager,
                contribution,
                formatMessageWithValues(
                    this.props.intl,
                    "contribution",
                    "CreateContribution.mutationLabel",
                )
            );

            const url = response?.payload.data?.createPremium?.paymentLink
            let contribution_id = response?.payload.data?.createPremium?.contributionId	
            if(url != null){
                window.open(url, '_blank').focus();
            }
            if (contribution.policy.uuid) {
                const args = `policyUuid: "${contribution.policy.uuid}"${
                  contribution_id ? `, contributionUuid: "${contribution_id}"` : ""
                }`;
              
                this.props.fetchPremiumValue([args]);
              }
        } else {
            this.props.updateContribution(
                this.props.modulesManager,
                contribution,
                formatMessageWithValues(
                    this.props.intl,
                    "contribution",
                    "UpdateContribution.mutationLabel",
                )
            );

        }
    }

    render() {
        const { classes, rights, contribution_uuid,policy_uuid, overview } = this.props;
        if (!rights.includes(RIGHT_CONTRIBUTION_EDIT)) return null;

        return (
            <div className={classes.page}>
                <ContributionForm
                    overview={overview}
                    contribution_uuid={contribution_uuid}
                    policy_uuid={policy_uuid}
                    back={e => {
                        window.history.back();
                    }}
                    save={rights.includes(RIGHT_CONTRIBUTION_EDIT) ? this.save : null}
                />
            </div>
        )
    }
}

const mapStateToProps = (state, props) => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    contribution_uuid: props.match.params.contribution_uuid,
    policy_uuid: props.match.params.policy_uuid,
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createContribution,fetchPremiumValue, updateContribution }, dispatch);
};

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(ContributionPage))
    ))));